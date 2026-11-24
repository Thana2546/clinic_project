from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import *
from .dashboard_views import *

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'daily-queues', DailyQueueViewSet, basename='daily-queue')
router.register(r'vitals', VitalViewSet, basename='vital')
router.register(r'medical-records', MedicalRecordViewSet, basename='medical-record')
router.register(r'follow-ups', FollowUpViewSet, basename='follow-up')
router.register(r'ICD-10', ICD10ViewSet, basename='ICD-10')

urlpatterns = [
    path('admin-dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('nurse-dashboard/', NurseDashboardView.as_view(), name='nurse-dashboard'),
    path('doctor-dashboard/', DoctorDashboardView.as_view(), name='doctor-dashboard'),
    path('', include(router.urls)),
]