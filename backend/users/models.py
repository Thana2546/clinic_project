import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'ผู้ดูแลระบบ'),
        ('doctor', 'แพทย์'),
        ('nurse', 'พยาบาล'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField("คำนำหน้า", max_length=50, null=True, blank=True)
    sex = models.CharField('เพศ', max_length=10)
    address = models.CharField('บ้านเลขที่', max_length=50, null=True, blank=True)
    moo = models.CharField('หมู่', max_length=50, blank=True, null=True)
    sub_district = models.CharField('ตำบล', max_length=100, null=True, blank=True)
    district = models.CharField('อำเภอ', max_length=100, null=True, blank=True)
    province = models.CharField('จังหวัด', max_length=100, null=True, blank=True)
    zipcode = models.CharField('รหัสไปรษณีย์', max_length=10, null=True, blank=True)
    phone = models.CharField('เบอร์โทรศัพท์', max_length=15, null=True, blank=True)
    role = models.CharField('บทบาท', max_length=20, choices=ROLE_CHOICES, default='nurse')
    
    def is_admin(self):
        return self.role == 'admin'
    def is_doctor(self):
        return self.role == 'doctor'
    def is_nurse(self):
        return self.role == 'nurse'
    
    def __str__(self):
        return f'{self.username} ({self.role})'

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    license_number = models.CharField('เลขใบประกอบวิชาชีพ', max_length=50, unique=True, null=True, blank=True)

    def __str__(self):
        return self.user.get_full_name()

class NurseProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='nurse_profile')
    license_number = models.CharField('เลขใบประกอบวิชาชีพ', max_length=50)
    
    def __str__(self):
        return self.user.get_full_name()