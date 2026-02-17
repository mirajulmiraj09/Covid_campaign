# operations/permissions.py
from rest_framework import permissions
from accounts.utils import is_doctor, is_patient


class IsDoctor(permissions.BasePermission):
    """Custom permission to only allow doctors"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and is_doctor(request.user)


class IsPatient(permissions.BasePermission):
    """Custom permission to only allow patients"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and is_patient(request.user)


class IsBookingOwner(permissions.BasePermission):
    """Custom permission to only allow booking owner"""
    def has_object_permission(self, request, view, obj):
        return obj.patient == request.user