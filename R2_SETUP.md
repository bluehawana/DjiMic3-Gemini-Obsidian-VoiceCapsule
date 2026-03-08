# Cloudflare R2 Storage Setup

## Why R2?

- **Cost-effective**: $0.015/GB storage, FREE egress (no bandwidth charges)
- **S3-compatible**: Works with standard tools
- **Fast**: Global CDN distribution
- **Integrated**: Part of your Cloudflare account

## Setup Steps

### 1. Create R2 Bucket

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **R2 Object Storage**
3. Click **Create bucket**
4. Name: `voice-capsule`
5. Location: **Automatic** (recommended)
6. Click **Create bucket**

### 2. Generate API Tokens

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Token name: `voice-capsule-api`
4. Permissions:
   - ✅ Object Read & Write
   - ✅ Bucket Read
5. TTL: **Forever** (or set expiration)
6. Click **Create API Token**
7. **SAVE THESE VALUES** (shown only once):
   - Access Key ID
   - Secret Access Key
   - Endpoint URL (contains your Account ID)

### 3. Configure Voice Capsule

SSH to your VPS:

```bash
ssh harvad@107.175.235.220
cd /opt/DjiMic3-Gemini-Obsidian-VoiceCapsule/web-app
```

Edit `.env` file:

```bash
nano .env
```

Add R2 configuration:

```bash
# Cloudflare R2 Storage
CF_ACCOUNT_ID=your_account_id_here
R2_ACCESS_KEY_ID=your_access_key_here
R2_SECRET_ACCESS_KEY=your_secret_key_here
R2_BUCKET_NAME=voice-capsule
```

Save and exit (Ctrl+X, Y, Enter)

### 4. Install Dependencies

```bash
source venv/bin/activate
pip install boto3
```

### 5. Test Connection

```bash
python3 r2_storage.py
```

Expected output:
```
Testing R2 connection...
Found 0 notes in R2
```

### 6. Restart Service

```bash
sudo systemctl restart voice-capsule
sudo systemctl status voice-capsule
```

## Usage

### Automatic Backup

Every note is automatically backed up to R2 when created.

### Manual Backup

From dashboard:
1. Click **☁️ Backup to R2** button
2. All notes are backed up with timestamp

### Restore from Backup

```bash
# List backups
aws s3 ls s3://voice-capsule/backups/ \
  --endpoint-url https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com

# Download backup
aws s3 cp s3://voice-capsule/backups/backup-20260306-120000.json . \
  --endpoint-url https://YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
```

## Storage Structure

```
voice-capsule/
├── notes/
│   ├── {note-id-1}.json
│   ├── {note-id-2}.json
│   └── ...
├── audio/
│   ├── {note-id-1}/
│   │   └── recording.mp3
│   ├── {note-id-2}/
│   │   └── recording.wav
│   └── ...
└── backups/
    ├── backup-20260306-120000.json
    ├── backup-20260307-120000.json
    └── ...
```

## Cost Estimation

### Storage Costs
- **Class A Operations** (write): $4.50 per million requests
- **Class B Operations** (read): $0.36 per million requests
- **Storage**: $0.015 per GB per month
- **Egress**: FREE (no bandwidth charges!)

### Example Usage
- 100 recordings/month × 5MB each = 500MB
- Storage: 500MB × $0.015 = $0.0075/month
- Uploads: 100 × $0.0000045 = $0.00045
- Reads: 1000 × $0.00000036 = $0.00036
- **Total: ~$0.01/month** 🎉

Compare to:
- AWS S3: ~$0.50/month (with egress charges)
- Dropbox: $11.99/month
- NotebookLM Plus: $20/month

## Public Access (Optional)

To make audio files publicly accessible:

1. Go to R2 bucket settings
2. Enable **Public Access**
3. Configure custom domain (optional):
   - Add CNAME: `audio.bluehawana.com` → R2 bucket URL
   - Enable in Cloudflare DNS

Then audio URLs become:
```
https://audio.bluehawana.com/audio/{note-id}/recording.mp3
```

## Security Best Practices

1. **Rotate API Keys**: Change keys every 90 days
2. **Limit Permissions**: Only grant necessary access
3. **Use Environment Variables**: Never commit keys to git
4. **Enable Versioning**: Protect against accidental deletion
5. **Set Lifecycle Rules**: Auto-delete old backups

## Troubleshooting

### Connection Failed

Check credentials:
```bash
echo $CF_ACCOUNT_ID
echo $R2_ACCESS_KEY_ID
# Don't echo secret key!
```

### Permission Denied

Verify token has correct permissions:
- Object Read & Write
- Bucket Read

### Bucket Not Found

Ensure bucket name matches `.env`:
```bash
R2_BUCKET_NAME=voice-capsule
```

### Slow Upload

R2 uses global anycast, but check:
- Network connection
- File size (compress audio if needed)
- VPS bandwidth limits

## Advanced Features

### Lifecycle Rules

Auto-delete old backups after 90 days:

1. Go to bucket settings
2. Add lifecycle rule:
   - Prefix: `backups/`
   - Delete after: 90 days

### Versioning

Enable versioning to protect against accidental deletion:

1. Go to bucket settings
2. Enable **Object Versioning**
3. Set retention period

### Custom Domain

Use your own domain for audio files:

1. Add CNAME in Cloudflare DNS:
   ```
   audio.bluehawana.com → voice-capsule.YOUR_ACCOUNT_ID.r2.cloudflarestorage.com
   ```

2. Update R2 bucket settings:
   - Add custom domain
   - Enable SSL

3. Update `.env`:
   ```bash
   R2_PUBLIC_URL=https://audio.bluehawana.com
   ```

## Migration from Local Storage

If you have existing notes stored locally:

```bash
# Run migration script
python3 scripts/migrate_to_r2.py
```

This will:
1. Upload all local notes to R2
2. Upload all audio files
3. Create backup
4. Verify integrity

## Monitoring

Check R2 usage:
1. Go to R2 dashboard
2. View **Analytics** tab
3. Monitor:
   - Storage used
   - Request count
   - Bandwidth (should be 0 cost!)

## Support

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [R2 Pricing](https://developers.cloudflare.com/r2/pricing/)
- [API Reference](https://developers.cloudflare.com/r2/api/)
