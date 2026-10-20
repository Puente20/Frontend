from django.db import models

class ActiveManager(models.Manager):
    """ The boolean field 'is_active' is required for this to work """
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True)

    
class ActiveStatusModel(models.Model):
    is_active = models.BooleanField(default=True)

    objects = ActiveManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

class Persona(ActiveStatusModel):
    nombre = models.CharField()
    apellido = models.CharField()
    dni = models.CharField()

    def apellido_nombre(self):
        return f"{self.apellido} {self.nombre}"

    def a_nombre(self):
        return f"{self.apellido[:1]} {self.nombre}"

    class Meta:
        abstract = True