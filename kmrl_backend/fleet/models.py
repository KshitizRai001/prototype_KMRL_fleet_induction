from django.db import models

class Train(models.Model):
    train_id = models.CharField(max_length=10, unique=True)
    fc_rs = models.BooleanField(default=False)
    fc_sig = models.BooleanField(default=False)
    fc_tel = models.BooleanField(default=False)
    open_jobs = models.IntegerField(default=0)
    branding_shortfall = models.IntegerField(default=0)
    mileage_km = models.IntegerField(default=0)
    cleaning_due = models.BooleanField(default=False)
    stabling_penalty = models.IntegerField(default=0)

    def __str__(self):
        return self.train_id