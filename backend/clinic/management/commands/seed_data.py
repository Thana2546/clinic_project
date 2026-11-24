import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from patients.models import *
from pharmacy.models import *
from users.models import *

User = get_user_model()

class Command(BaseCommand):
    help = 'สร้างข้อมูลจำลองสำหรับทดสอบระบบคลินิก'
    
    def handle(self, *args, **kwargs):
        self.stdout.write('กำลังเริ่มสร้างข้อมูลจำลอง...')
        today = timezone.now().date()
        
        doctor1, created = User.objects.get_or_create(
            username='doctor1', 
            defaults={
                'title': 'นพ.', 'first_name': 'สมเกียรติ', 'last_name': 'รักษาดี', 
                'sex': 'Male', 'address': '12/34', 'moo': '5',
                'sub_district': 'บางเขน', 'district': 'เมือง', 'province': 'นนทบุรี',
                'zipcode': '11000', 'phone': '0811112222', 'role': 'doctor'
            }
        )
        if created:
            doctor1.set_password('123456'); doctor1.save()
            DoctorProfile.objects.create(user=doctor1, license_number='ว.12345')

        doctor2, created = User.objects.get_or_create(
            username='doctor2', 
            defaults={
                'title': 'พญ.', 'first_name': 'วิภาวี', 'last_name': 'ใจเย็น', 
                'sex': 'Female', 'address': '99/9', 'moo': '1',
                'sub_district': 'ศาลายา', 'district': 'พุทธมณฑล', 'province': 'นครปฐม',
                'zipcode': '73170', 'phone': '0822223333', 'role': 'doctor'
            }
        )
        if created:
            doctor2.set_password('123456'); doctor2.save()
            DoctorProfile.objects.create(user=doctor2, license_number='ว.98765')

        nurse1, created = User.objects.get_or_create(
            username='nurse1', 
            defaults={
                'title': 'นางสาว', 'first_name': 'ปราณี', 'last_name': 'ใส่ใจ', 
                'sex': 'Female', 'address': '45', 'moo': '2',
                'sub_district': 'บางซื่อ', 'district': 'บางซื่อ', 'province': 'กรุงเทพมหานคร',
                'zipcode': '10800', 'phone': '0899998888', 'role': 'nurse'
            }
        )
        if created:
            nurse1.set_password('123456'); nurse1.save()
            NurseProfile.objects.create(user=nurse1, license_number='พ.112233')

        self.stdout.write(self.style.SUCCESS('- สร้างข้อมูลผู้ใช้งานระบบ (Users) สำเร็จ'))