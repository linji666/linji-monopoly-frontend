cd /root || exit 1
echo "start download..."
curl -L -o qq2.deb --max-time 240 \
  -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36" \
  -H "Referer: https://im.qq.com/" \
  "https://down.bytes.tcdnos.com/qqweb/LinuxQQ/linuxqq_2.0.0-b2-1089_amd64.deb?mkey=lego_ztc&f=00&sche_type=7&cip=27.38.200.123&proto=https&access_type=&tx_domain=down.qq.com&tx_path=%2Fqqweb%2F&tx_id=6c9382a8c8"
echo "----"
ls -lh qq2.deb
file qq2.deb 2>/dev/null
echo DL3OK
