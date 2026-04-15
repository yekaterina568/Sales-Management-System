from django.contrib import admin
from .models import Contact, Deal, Note, Task

admin.site.register(Note)
admin.site.register(Task)

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email', 'owner')
    list_filter = ('owner',)

@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'amount', 'contact', 'owner')