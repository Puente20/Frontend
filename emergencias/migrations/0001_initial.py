from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]

    operations = [
        migrations.CreateModel(
            name='AlertaPanico',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre_completo', models.CharField(max_length=160)),
                ('numero_lote', models.CharField(max_length=30)),
                ('telefono', models.CharField(max_length=40)),
                ('creada_en', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('estado', models.CharField(max_length=10, choices=[('pendiente', 'Pendiente'), ('atendida', 'Atendida'), ('rechazada', 'Rechazada')], default='pendiente', db_index=True)),
                ('resuelta_en', models.DateTimeField(blank=True, null=True)),
                ('guardia', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.PROTECT, related_name='emergencias_resueltas', to=settings.AUTH_USER_MODEL)),
                ('socio', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='emergencias_enviadas', to=settings.AUTH_USER_MODEL)),
            ],
            options={'ordering': ['creada_en', 'id']},
        ),
    ]
