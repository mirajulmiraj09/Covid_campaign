# campaigns/permissions.py
from rest_framework import permissions
from accounts.utils import is_doctor, is_patient


class IsDoctor(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and is_doctor(request.user)


class IsPatient(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and is_patient(request.user)