from django.apps import AppConfig


class SalesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'crm_project.sales'

    def ready(self):
        import crm_project.sales.signals