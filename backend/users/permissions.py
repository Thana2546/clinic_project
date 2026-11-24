from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    """อนุญาตเฉพาะ Admin เท่านั้น"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin())

class IsDoctor(permissions.BasePermission):
    """อนุญาตเฉพาะ Doctor เท่านั้น"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_doctor())

class IsNurse(permissions.BasePermission):
    """อนุญาตเฉพาะ Nurse เท่านั้น"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_nurse())

class IsAdminOrDoctor(permissions.BasePermission):
    """อนุญาต Admin หรือ Doctor (เช่น ดูประวัติการรักษา)"""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.is_admin() or request.user.is_doctor()))