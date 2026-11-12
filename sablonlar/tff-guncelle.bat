<# : batch
@echo off
chcp 65001 >nul
set "KOPRU_YOL=%~f0"
set "KOPRU_SESSIZ=%~1"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d=Join-Path $env:LOCALAPPDATA '1453-TFF'; New-Item -ItemType Directory -Force -Path $d | Out-Null; $p=Join-Path $d 'guncelle.ps1'; [IO.File]::WriteAllText($p,[IO.File]::ReadAllText($env:KOPRU_YOL,[Text.Encoding]::UTF8),(New-Object Text.UTF8Encoding $true)); & $p"
if /i not "%~1"=="sessiz" pause
exit /b
#>

# ---------------------------------------------------------------------------
# 1453 İstanbul AS — TFF İstanbul güncelleme programı (çift tıklayın)
# TFF İstanbul sitesi, kulüp sitesinin sunucusundan gelen bağlantıları kabul etmiyor.
# Bu program Türkiye'deki bu bilgisayardan TFF sayfalarını okur ve kulüp sitesine gönderir.
# Sayfaları ayrıştırıp kaydetmeyi kulüp sitesi yapar. Bu bilgisayarda şifre tutulmaz;
# yalnızca aşağıdaki program anahtarı vardır (panelden "Anahtarı yenile" ile iptal edilebilir).
# ---------------------------------------------------------------------------

$ErrorActionPreference = 'Stop'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch {}

$SITE = '__SITE__'
$ANAHTAR = '__ANAHTAR__'
$TFF = 'https://tffistanbul.org'
$GOREV_ADI = '1453 TFF Guncelleme'
$sessiz = ($env:KOPRU_SESSIZ -eq 'sessiz')

$klasor = Join-Path $env:LOCALAPPDATA '1453-TFF'
New-Item -ItemType Directory -Force -Path $klasor | Out-Null
$gunluk = Join-Path $klasor 'gunluk.txt'

function Yaz([string]$mesaj) {
  Write-Host $mesaj
  try { Add-Content -LiteralPath $gunluk -Value ("{0}  {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $mesaj) -Encoding UTF8 } catch {}
}

function Sikistir([byte[]]$bayt) {
  $ms = New-Object IO.MemoryStream
  $gz = New-Object IO.Compression.GZipStream($ms, [IO.Compression.CompressionMode]::Compress)
  $gz.Write($bayt, 0, $bayt.Length)
  $gz.Close()
  return [Convert]::ToBase64String($ms.ToArray())
}

function TffSayfasi([string]$yol) {
  $wc = New-Object Net.WebClient
  $wc.Headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
  $wc.Headers['Accept-Language'] = 'tr-TR,tr;q=0.9'
  try {
    $bayt = $wc.DownloadData($TFF + $yol)
    Start-Sleep -Milliseconds 700
    return (Sikistir $bayt)
  } catch {
    Yaz ("  ! TFF sayfası alınamadı: {0} ({1})" -f $yol, $_.Exception.Message)
    return ''
  } finally { $wc.Dispose() }
}

function SiteyeGonder($sayfalar) {
  # Değerler yalnızca base64, anahtarlar yalnızca adres karakterleri içerir; JSON elle kurulur
  $parcalar = foreach ($k in $sayfalar.Keys) { '"' + $k + '":"' + $sayfalar[$k] + '"' }
  $govde = '{"sayfalar":{' + ($parcalar -join ',') + '}}'
  $bayt = [Text.Encoding]::UTF8.GetBytes($govde)
  try {
    return Invoke-RestMethod -Uri ($SITE + '/api/tff/kopru') -Method Post -Body $bayt `
      -ContentType 'application/json; charset=utf-8' -Headers @{ 'x-kopru-anahtari' = $ANAHTAR } -TimeoutSec 180
  } catch {
    $ayrinti = $_.ErrorDetails.Message
    if (-not $ayrinti) { $ayrinti = $_.Exception.Message }
    return [pscustomobject]@{ durum = 'hata'; hata = $ayrinti }
  }
}

Yaz ''
Yaz '1453 İstanbul AS — TFF güncellemesi başladı'
$sayfalar = @{}
$yanit = $null
for ($tur = 1; $tur -le 8; $tur++) {
  $yanit = SiteyeGonder $sayfalar
  if ($yanit.durum -ne 'eksik') { break }
  $yeni = @($yanit.eksik | Where-Object { -not $sayfalar.ContainsKey($_) })
  if ($yeni.Count -eq 0) { $yanit = [pscustomobject]@{ durum = 'hata'; hata = 'Site aynı sayfaları yeniden istedi.' }; break }
  Yaz ("Adım {0}: TFF'den {1} sayfa okunuyor..." -f $tur, $yeni.Count)
  foreach ($y in $yeni) { $sayfalar[$y] = TffSayfasi $y }
}

if ($yanit.durum -eq 'tamam') {
  Yaz 'Güncelleme tamamlandı:'
  foreach ($satir in $yanit.ozet) { Yaz ('  ' + $satir) }
} else {
  Yaz ('Güncelleme tamamlanamadı: ' + $yanit.hata)
}

# İlk elle çalıştırmada: programı kalıcı klasöre kopyala ve isteğe göre otomatik görev kur
if (-not $sessiz) {
  $kopya = Join-Path $klasor 'TFF-Guncelle.bat'
  try {
    if ($env:KOPRU_YOL -and ($env:KOPRU_YOL -ne $kopya)) { Copy-Item -LiteralPath $env:KOPRU_YOL -Destination $kopya -Force }
  } catch { Yaz ('Program kopyalanamadı: ' + $_.Exception.Message) }

  $gorev = $null
  try { $gorev = Get-ScheduledTask -TaskName $GOREV_ADI -ErrorAction SilentlyContinue } catch {}
  if (-not $gorev) {
    Write-Host ''
    $cevap = Read-Host 'Her gün 08:00 ve 20:00''de kendiliğinden çalışsın mı? (E/H)'
    if ($cevap -match '^[eEyY]') {
      try {
        $eylem = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument ('/c ""' + $kopya + '" sessiz"')
        $tetikler = @((New-ScheduledTaskTrigger -Daily -At '08:00'), (New-ScheduledTaskTrigger -Daily -At '20:00'))
        $ayar = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 15)
        Register-ScheduledTask -TaskName $GOREV_ADI -Action $eylem -Trigger $tetikler -Settings $ayar `
          -Description '1453 İstanbul AS sitesini TFF İstanbul verileriyle günceller.' | Out-Null
        Yaz 'Otomatik görev kuruldu: her gün 08:00 ve 20:00. Bilgisayar o saatte kapalıysa açılınca çalışır.'
      } catch {
        Yaz ('Otomatik görev kurulamadı: ' + $_.Exception.Message)
        Yaz 'Programa sağ tıklayıp "Yönetici olarak çalıştır" ile açın ve soruya yeniden E deyin.'
      }
    }
  } else {
    Yaz 'Otomatik görev zaten kurulu (her gün 08:00 ve 20:00).'
  }
  Write-Host ''
  Write-Host ('Kayıtlar: ' + $gunluk)
}
