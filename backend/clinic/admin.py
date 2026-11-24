from django.contrib import admin
from . import models

# Register your models here.
admin.site.register(models.Appointment)
admin.site.register(models.DailyQueue)
admin.site.register(models.Diagnosis)
admin.site.register(models.FollowUp)
admin.site.register(models.MedicalRecord)
admin.site.register(models.Vital)