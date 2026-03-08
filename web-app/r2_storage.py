#!/usr/bin/env python3
"""
Cloudflare R2 Storage Integration
Handles backup, restore, and storage of voice notes
"""

import os
import json
import boto3
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()


class R2Storage:
    """Cloudflare R2 Storage Manager"""
    
    def __init__(self):
        self.account_id = os.getenv("CF_ACCOUNT_ID")
        self.access_key_id = os.getenv("R2_ACCESS_KEY_ID")
        self.secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY")
        self.bucket_name = os.getenv("R2_BUCKET_NAME", "voice-capsule")
        
        if not all([self.account_id, self.access_key_id, self.secret_access_key]):
            raise ValueError("R2 credentials not configured")
        
        # Initialize S3 client with R2 endpoint
        self.s3 = boto3.client(
            's3',
            endpoint_url=f'https://{self.account_id}.r2.cloudflarestorage.com',
            aws_access_key_id=self.access_key_id,
            aws_secret_access_key=self.secret_access_key,
            region_name='auto'
        )
    
    def upload_note(self, note_id: str, content: Dict[str, Any]) -> bool:
        """Upload a note to R2"""
        try:
            key = f"notes/{note_id}.json"
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=json.dumps(content, indent=2),
                ContentType='application/json'
            )
            return True
        except Exception as e:
            print(f"Failed to upload note: {e}")
            return False
    
    def upload_audio(self, note_id: str, audio_path: Path) -> Optional[str]:
        """Upload audio file to R2"""
        try:
            key = f"audio/{note_id}/{audio_path.name}"
            with open(audio_path, 'rb') as f:
                self.s3.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=f,
                    ContentType='audio/mpeg'
                )
            
            # Return public URL (if bucket is public) or signed URL
            url = f"https://{self.bucket_name}.{self.account_id}.r2.cloudflarestorage.com/{key}"
            return url
        except Exception as e:
            print(f"Failed to upload audio: {e}")
            return None
    
    def get_note(self, note_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a note from R2"""
        try:
            key = f"notes/{note_id}.json"
            response = self.s3.get_object(Bucket=self.bucket_name, Key=key)
            content = response['Body'].read().decode('utf-8')
            return json.loads(content)
        except Exception as e:
            print(f"Failed to get note: {e}")
            return None
    
    def list_notes(self) -> List[Dict[str, Any]]:
        """List all notes from R2"""
        try:
            response = self.s3.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix='notes/'
            )
            
            notes = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    note_id = obj['Key'].replace('notes/', '').replace('.json', '')
                    note = self.get_note(note_id)
                    if note:
                        notes.append(note)
            
            return notes
        except Exception as e:
            print(f"Failed to list notes: {e}")
            return []
    
    def delete_note(self, note_id: str) -> bool:
        """Delete a note from R2"""
        try:
            # Delete note JSON
            self.s3.delete_object(
                Bucket=self.bucket_name,
                Key=f"notes/{note_id}.json"
            )
            
            # Delete associated audio files
            response = self.s3.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=f"audio/{note_id}/"
            )
            
            if 'Contents' in response:
                for obj in response['Contents']:
                    self.s3.delete_object(
                        Bucket=self.bucket_name,
                        Key=obj['Key']
                    )
            
            return True
        except Exception as e:
            print(f"Failed to delete note: {e}")
            return False
    
    def backup_all(self, notes: List[Dict[str, Any]]) -> bool:
        """Backup all notes to R2"""
        try:
            # Create backup manifest
            backup = {
                'timestamp': datetime.now().isoformat(),
                'count': len(notes),
                'notes': notes
            }
            
            key = f"backups/backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}.json"
            self.s3.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=json.dumps(backup, indent=2),
                ContentType='application/json'
            )
            
            return True
        except Exception as e:
            print(f"Failed to backup: {e}")
            return False
    
    def restore_backup(self, backup_key: str) -> Optional[List[Dict[str, Any]]]:
        """Restore notes from a backup"""
        try:
            response = self.s3.get_object(Bucket=self.bucket_name, Key=backup_key)
            content = response['Body'].read().decode('utf-8')
            backup = json.loads(content)
            return backup.get('notes', [])
        except Exception as e:
            print(f"Failed to restore backup: {e}")
            return None
    
    def list_backups(self) -> List[Dict[str, Any]]:
        """List all available backups"""
        try:
            response = self.s3.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix='backups/'
            )
            
            backups = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    backups.append({
                        'key': obj['Key'],
                        'size': obj['Size'],
                        'last_modified': obj['LastModified'].isoformat()
                    })
            
            return backups
        except Exception as e:
            print(f"Failed to list backups: {e}")
            return []


# Example usage
if __name__ == "__main__":
    storage = R2Storage()
    
    # Test connection
    print("Testing R2 connection...")
    notes = storage.list_notes()
    print(f"Found {len(notes)} notes in R2")
