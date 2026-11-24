from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from .models import Patient
from .serializers import PatientSerializer
from users.permissions import IsNurse

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all().order_by('-created_at')
    serializer_class = PatientSerializer
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['id_card', 'hn_number', 'first_name', 'last_name', 'phone']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsNurse]
            
        return [permission() for permission in permission_classes]