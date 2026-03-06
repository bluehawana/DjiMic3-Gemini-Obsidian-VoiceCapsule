#!/usr/bin/env python3
"""
Personal Voice Capsule - Transcription Module
Handles audio transcription using Google Gemini API
"""

import os
import sys
import argparse
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Any

try:
    import google.generativeai as genai
    from dotenv import load_dotenv
    from rich.console import Console
    from rich.progress import Progress, SpinnerColumn, TextColumn
except ImportError as e:
    print(f"Error: Missing required package. Run: pip install -r requirements.txt")
    print(f"Details: {e}")
    sys.exit(1)

console = Console()


class VoiceCapsuleTranscriber:
    """Handles audio transcription using Gemini API"""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize transcriber with configuration"""
        self.config = self._load_config(config_path)
        self._setup_gemini()
        
    def _load_config(self, config_path: Optional[str]) -> Dict[str, Any]:
        """Load configuration from .env file"""
        if config_path:
            load_dotenv(config_path)
        else:
            # Try multiple locations
            possible_paths = [
                Path.cwd() / "configs" / ".env",
                Path.cwd() / ".env",
                Path.home() / ".personal-voice-capsule" / ".env"
            ]
            for path in possible_paths:
                if path.exists():
                    load_dotenv(path)
                    break
        
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_api_key_here":
            console.print("[red]Error: GEMINI_API_KEY not set in .env file[/red]")
            console.print("Get your API key from: https://aistudio.google.com/app/apikey")
            sys.exit(1)
            
        return {
            "api_key": api_key,
            "model": os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
            "language": os.getenv("TRANSCRIPTION_LANGUAGE", "auto"),
            "max_retries": int(os.getenv("MAX_RETRIES", "3")),
        }
    
    def _setup_gemini(self):
        """Configure Gemini API"""
        genai.configure(api_key=self.config["api_key"])
        self.model = genai.GenerativeModel(self.config["model"])
        
    def transcribe_audio(self, audio_path: Path) -> Optional[str]:
        """
        Transcribe audio file using Gemini API
        
        Args:
            audio_path: Path to audio file (WAV, MP3, M4A)
            
        Returns:
            Transcribed text or None if failed
        """
        if not audio_path.exists():
            console.print(f"[red]Error: Audio file not found: {audio_path}[/red]")
            return None
            
        console.print(f"[cyan]Transcribing: {audio_path.name}[/cyan]")
        
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console
        ) as progress:
            task = progress.add_task("Processing audio...", total=None)
            
            try:
                # Upload audio file
                audio_file = genai.upload_file(path=str(audio_path))
                progress.update(task, description="Uploaded, transcribing...")
                
                # Create prompt based on language setting
                prompt = self._create_prompt()
                
                # Generate transcription
                response = self.model.generate_content([prompt, audio_file])
                
                # Clean up uploaded file
                audio_file.delete()
                
                if response.text:
                    console.print("[green]✓ Transcription complete[/green]")
                    return response.text.strip()
                else:
                    console.print("[yellow]Warning: Empty transcription[/yellow]")
                    return None
                    
            except Exception as e:
                console.print(f"[red]Error during transcription: {e}[/red]")
                return None
    
    def _create_prompt(self) -> str:
        """Create transcription prompt based on language setting"""
        lang = self.config["language"]
        
        base_prompt = """Transcribe this audio recording accurately. 
        
Rules:
- Preserve the speaker's exact words and meaning
- Use proper punctuation and paragraph breaks
- If multiple speakers, indicate with "Speaker 1:", "Speaker 2:", etc.
- If unclear audio, mark with [inaudible]
- Do not add commentary or interpretation
"""
        
        if lang != "auto":
            lang_names = {
                "en": "English",
                "zh": "Chinese",
                "sv": "Swedish", 
                "es": "Spanish",
                "fr": "French",
                "de": "German",
                "ja": "Japanese",
                "ko": "Korean"
            }
            language_name = lang_names.get(lang, lang)
            base_prompt += f"\n- Transcribe in {language_name}"
            
        return base_prompt
    
    def batch_transcribe(self, audio_dir: Path) -> Dict[str, str]:
        """
        Transcribe all audio files in a directory
        
        Args:
            audio_dir: Directory containing audio files
            
        Returns:
            Dictionary mapping filenames to transcriptions
        """
        results = {}
        audio_extensions = {".wav", ".mp3", ".m4a", ".ogg", ".flac"}
        
        audio_files = [
            f for f in audio_dir.iterdir() 
            if f.suffix.lower() in audio_extensions
        ]
        
        if not audio_files:
            console.print(f"[yellow]No audio files found in {audio_dir}[/yellow]")
            return results
            
        console.print(f"[cyan]Found {len(audio_files)} audio file(s)[/cyan]")
        
        for audio_file in audio_files:
            transcription = self.transcribe_audio(audio_file)
            if transcription:
                results[audio_file.name] = transcription
                
        return results


def main():
    """CLI entry point"""
    parser = argparse.ArgumentParser(
        description="Personal Voice Capsule - Transcribe audio to text"
    )
    parser.add_argument(
        "audio_path",
        nargs="?",
        help="Path to audio file or directory"
    )
    parser.add_argument(
        "--config",
        help="Path to .env configuration file"
    )
    parser.add_argument(
        "--output",
        help="Output file for transcription (default: stdout)"
    )
    parser.add_argument(
        "--test",
        action="store_true",
        help="Test API connection"
    )
    
    args = parser.parse_args()
    
    # Initialize transcriber
    transcriber = VoiceCapsuleTranscriber(config_path=args.config)
    
    # Test mode
    if args.test:
        console.print("[green]✓ Configuration loaded successfully[/green]")
        console.print(f"Model: {transcriber.config['model']}")
        console.print(f"Language: {transcriber.config['language']}")
        console.print("\n[cyan]Ready to transcribe audio files![/cyan]")
        return
    
    # Require audio path
    if not args.audio_path:
        parser.print_help()
        return
        
    audio_path = Path(args.audio_path)
    
    # Handle directory or single file
    if audio_path.is_dir():
        results = transcriber.batch_transcribe(audio_path)
        for filename, transcription in results.items():
            console.print(f"\n[bold]{filename}[/bold]")
            console.print(transcription)
            console.print("-" * 80)
    else:
        transcription = transcriber.transcribe_audio(audio_path)
        if transcription:
            if args.output:
                output_path = Path(args.output)
                output_path.write_text(transcription, encoding="utf-8")
                console.print(f"[green]Saved to: {output_path}[/green]")
            else:
                console.print("\n[bold]Transcription:[/bold]")
                console.print(transcription)


if __name__ == "__main__":
    main()
