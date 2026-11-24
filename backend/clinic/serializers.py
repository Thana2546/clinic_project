from rest_framework import serializers
from .models import *
from .services import generate_queue_number

# Serializer สำหรับข้อมูลนัดหมาย
class AppointmentSerializer(serializers.ModelSerializer):
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)

    class Meta:
        model = Appointment
        fields = '__all__'

# Serializer สำหรับคิวประจำวัน
class DailyQueueSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    hn_number = serializers.CharField(source='patient.hn_number', read_only=True)

    class Meta:
        model = DailyQueue
        fields = '__all__'
        read_only_fields = [
            'id',
            'queue_number',
            'queue_date',
            'status',
            'created_at',
            'updated_at'
        ]
    
    def get_patient_name(self, obj):
            return (
                f"{obj.patient.title}{obj.patient.first_name} {obj.patient.last_name}"
            )

    def create(self, validated_data):
        queue_type = validated_data.get('queue_type')
        validated_data['queue_number'] = generate_queue_number(queue_type)

        return super().create(validated_data)

# Serializer สำหรับเปลี่ยนสถานะคิว
class QueueStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=DailyQueue.STATUS_CHOICES,
        error_messages={
            'required': 'กรุณาระบุสถานะ',
            'invalid_choice': 'สถานะที่ส่งมาไม่ถูกต้อง'
        }
    )
    doctor_id = serializers.UUIDField(required=False, allow_null=True)

# Serializer สำหรับข้อมูล Vital Sign
class VitalSerializer(serializers.ModelSerializer):
    recorded_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Vital
        fields = '__all__'
        read_only_fields = [
            'id',
            'recorded_by',
            'recorded_at'
        ]

    def validate_weight(self, value):
        if value <= 0:
            raise serializers.ValidationError("น้ำหนักต้องมากกว่า 0")

        return value

    def validate_height(self, value):
        if value <= 0:
            raise serializers.ValidationError("ส่วนสูงต้องมากกว่า 0")

        return value

    def validate(self, data):
        systolic = data.get('systolic_bp')
        diastolic = data.get('diastolic_bp')

        if systolic and diastolic:
            if diastolic >= systolic:
                raise serializers.ValidationError({
                    "blood_pressure": "ค่าความดันตัวบนต้องมากกว่าค่าความดันตัวล่าง"
                })

        return data
    
    def get_recorded_by_name(self, obj):
        return f'{obj.recorded_by.first_name} {obj.recorded_by.last_name}'

# Serializer สำหรับข้อมูลการวินิจฉัย
class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = [
            'id',
            'icd10_code',
            'description'
        ]
        read_only_fields = ['id']

# Serializer สำหรับข้อมูลประวัติการรักษา
class MedicalRecordSerializer(serializers.ModelSerializer):
    diagnoses = DiagnosisSerializer(many=True, required=False)
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = MedicalRecord
        fields = '__all__'
        read_only_fields = [
            'id',
            'doctor',
            'created_at'
        ]

    def create(self, validated_data):
        diagnoses_data = validated_data.pop('diagnoses', [])
        
        medical_record = MedicalRecord.objects.create(
            **validated_data
        )

        for diagnosis_data in diagnoses_data:
            Diagnosis.objects.create(medical_record=medical_record, **diagnosis_data)

        return medical_record

    def update(self, instance, validated_data):
        diagnoses_data = validated_data.pop('diagnoses', None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        if diagnoses_data is not None:
            instance.diagnoses.all().delete()

            for diagnosis_data in diagnoses_data:
                Diagnosis.objects.create(medical_record=instance, **diagnosis_data)

        return instance

    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"

# Serializer สำหรับการนัดติดตามผล
class FollowUpSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    medical_record_id = serializers.PrimaryKeyRelatedField(
        queryset=MedicalRecord.objects.all(),
        source='medical_record',
        write_only=True,
        error_messages={
            'required': 'กรุณาระบุประวัติการรักษา',
            'does_not_exist': 'ไม่พบประวัติการรักษาที่ระบุ',
            'incorrect_type': 'รูปแบบประวัติการรักษาไม่ถูกต้อง'
        }
    )

    class Meta:
        model = FollowUp
        fields = [
            'id',
            'patient',
            'patient_name',
            'doctor',
            'doctor_name',
            'medical_record_id',
            'medical_record',
            'follow_up_date',
            'follow_up_time',
            'note',
            'status'
        ]
        read_only_fields = [
            'id',
            'patient',
            'doctor',
            'medical_record',
            'status'
        ]

    def get_patient_name(self, obj):
        return (
            f"{obj.patient.title}{obj.patient.first_name} {obj.patient.last_name}"
        )
    
    def get_doctor_name(self, obj):
        return f"{obj.doctor.first_name} {obj.doctor.last_name}"

class ICD10Serializer(serializers.ModelSerializer):
    class Meta:
        model = ICD10
        fields = '__all__'