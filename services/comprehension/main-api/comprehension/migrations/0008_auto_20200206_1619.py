# Generated by Django 2.2.5 on 2020-02-06 16:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comprehension', '0007_highlight'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='ruleset',
            name='test_for_contains',
        ),
        migrations.AddField(
            model_name='ruleset',
            name='is_focus_point',
            field=models.BooleanField(default=False),
        ),
    ]
