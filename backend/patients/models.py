import uuid
from django.db import models

# Create your models here.
class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    hn_number = models.CharField("รหัสผู้ป่วย", max_length=20, unique=True, db_index=True)
    id_card = models.CharField("เลขบัตรประชาชน", max_length=13, db_index=True)
    title = models.CharField("คำนำหน้า", max_length=50)
    first_name = models.CharField("ชื่อ", max_length=100)
    last_name = models.CharField("นามสกุล", max_length=100)
    date_of_birth = models.DateField("วันเกิด")
    sex = models.CharField('เพศ', max_length=10)
    blood_group = models.CharField("หมู่เลือด", max_length=5, blank=True, null=True)
    phone = models.CharField("เบอร์โทรศัพท์", max_length=20, blank=True, null=True)
    address = models.TextField('ที่อยู่', null=True, blank=True)
    district = models.CharField('อำเภอ/เขต', max_length=100, null=True, blank=True)
    province = models.CharField('จังหวัด', max_length=100, null=True, blank=True)
    zipcode = models.CharField('รหัสไปรษณีย์', max_length=10, null=True, blank=True)
    chronic = models.TextField('โรคประจำตัว', blank=True, null=True)
    allergic = models.TextField("รายการแพ้ยา", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.hn_number} - {self.first_name} {self.last_name}"