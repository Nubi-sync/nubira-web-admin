import os
import io
import json
import urllib.request
from PIL import Image

# 1. Load env vars
env = {}
with open('.env.local', 'r') as f:
    for line in f:
        if '=' in line and not line.startswith('#'):
            k, v = line.strip().split('=', 1)
            env[k.strip()] = v.strip()

supabase_url = env.get('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = env.get('SUPABASE_SERVICE_ROLE_KEY')

# Create output dir
os.makedirs('public/images/hero', exist_ok=True)

images_to_process = [
    {
        'input': 'public/testimage new 1.jpeg',
        'slug': 'hero_craftswoman_sewing',
        'max_width': 1920,
        'webp_quality': 85,
        'jpg_quality': 85,
    },
    {
        'input': 'public/hero_slide_2.jpg',
        'slug': 'hero_apparel_production_line',
        'max_width': 1920,
        'webp_quality': 85,
        'jpg_quality': 85,
    },
    {
        'input': 'public/testimage new 2.jpeg',
        'slug': 'hero_quality_supervisor_floor',
        'max_width': 1920,
        'webp_quality': 85,
        'jpg_quality': 85,
    },
    {
        'input': 'public/indian_textile_motif.jpg',
        'slug': 'indian_textile_motif',
        'max_width': 1200,
        'webp_quality': 85,
        'jpg_quality': 85,
    }
]

uploaded_urls = {}

for item in images_to_process:
    in_path = item['input']
    slug = item['slug']
    print(f"\nProcessing {in_path} (Original size: {os.path.getsize(in_path):,} bytes)...")
    
    with Image.open(in_path) as img:
        # Convert RGBA/P to RGB if needed
        if img.mode in ('RGBA', 'LA', 'P'):
            img = img.convert('RGB')
        
        # Resize if larger than max_width
        w, h = img.size
        if w > item['max_width']:
            new_h = int(h * (item['max_width'] / w))
            img = img.resize((item['max_width'], new_h), Image.Resampling.LANCZOS)
            print(f"  Resized from {w}x{h} to {item['max_width']}x{new_h}")
        else:
            print(f"  Original resolution {w}x{h} preserved")
        
        # 1. Save Optimized WebP
        webp_local_path = f"public/images/hero/{slug}.webp"
        img.save(webp_local_path, format='WEBP', quality=item['webp_quality'], method=6)
        webp_size = os.path.getsize(webp_local_path)
        print(f"  Saved WebP: {webp_local_path} ({webp_size:,} bytes, {((1 - webp_size/os.path.getsize(in_path))*100):.1f}% reduction)")
        
        # 2. Save Optimized JPG
        jpg_local_path = f"public/images/hero/{slug}.jpg"
        img.save(jpg_local_path, format='JPEG', quality=item['jpg_quality'], optimize=True, progressive=True)
        jpg_size = os.path.getsize(jpg_local_path)
        print(f"  Saved JPG:  {jpg_local_path} ({jpg_size:,} bytes, {((1 - jpg_size/os.path.getsize(in_path))*100):.1f}% reduction)")
        
        # Upload WebP to Supabase Storage
        for ext, local_path, mime in [('webp', webp_local_path, 'image/webp'), ('jpg', jpg_local_path, 'image/jpeg')]:
            storage_path = f"hero/{slug}.{ext}"
            upload_url = f"{supabase_url}/storage/v1/object/landing-assets/{storage_path}"
            
            with open(local_path, 'rb') as f_upload:
                file_bytes = f_upload.read()
            
            req = urllib.request.Request(
                upload_url,
                data=file_bytes,
                headers={
                    'apikey': supabase_key,
                    'Authorization': f'Bearer {supabase_key}',
                    'Content-Type': mime,
                    'x-upsert': 'true',
                    'Cache-Control': 'public, max-age=31536000, immutable'
                },
                method='POST'
            )
            try:
                with urllib.request.urlopen(req) as resp:
                    public_url = f"{supabase_url}/storage/v1/object/public/landing-assets/{storage_path}"
                    print(f"  Uploaded to Supabase Storage: {public_url}")
                    uploaded_urls[f"{slug}_{ext}"] = public_url
            except Exception as e:
                print(f"  Error uploading {storage_path}: {e}")

print("\n--- Summary of Uploaded Supabase Assets ---")
print(json.dumps(uploaded_urls, indent=2))
