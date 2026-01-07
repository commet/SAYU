import requests
import json

# Direct SQL execution through Supabase REST API
url = "https://hgltvdshuyfffskvjmst.supabase.co/rest/v1/rpc"
headers = {
    "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnbHR2ZHNodXlmZmZza3ZqbXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODk1MzEsImV4cCI6MjA2ODA2NTUzMX0.PyoZ0e0P5NtWjMimxGimsJQ6nfFNRFmT4i0bRMEjxTk",
    "Content-Type": "application/json"
}

print("🔍 Checking current venue table status...")

# Check venues count
venues_url = "https://hgltvdshuyfffskvjmst.supabase.co/rest/v1/venues?select=count"
response = requests.get(venues_url, headers=headers)
print(f"Current venues count: {response.text}")

# Check venues_simple count
venues_simple_url = "https://hgltvdshuyfffskvjmst.supabase.co/rest/v1/venues_simple?select=count"
response = requests.get(venues_simple_url, headers=headers)
print(f"Current venues_simple count: {response.text}")

print("\n❗ RLS 정책 문제로 인해 직접 INSERT가 불가능합니다.")
print("다음 방법 중 하나를 선택해주세요:\n")
print("1. Supabase 대시보드에서 SQL Editor를 열고 다음 SQL을 실행:")
print("   - fix-rls-and-migrate.sql 파일의 내용을 복사/붙여넣기")
print("\n2. Supabase 대시보드에서 Authentication > Policies로 가서:")
print("   - venues 테이블의 RLS 정책을 일시적으로 비활성화")
print("   - 그 후 migrate-all-venues.js 다시 실행")
print("\n3. 현재 구조 유지:")
print("   - venues_simple을 계속 사용")
print("   - exhibitions_master는 venues_simple 참조 유지")

print("\n현재 상태:")
print("- venues 테이블: 963개 (외부 데이터, 코드는 제거됨)")
print("- venues_simple 테이블: 125개 (핵심 장소)")
print("- exhibitions_master: venues_simple을 참조 중")