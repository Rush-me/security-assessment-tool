import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-about-data-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './about-data-dialog.component.html',
  styleUrls: ['./about-data-dialog.component.scss']
})
export class AboutDataDialogComponent {
  readonly data = inject<{ title: string; body: string }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AboutDataDialogComponent>);

  close(): void {
    this.dialogRef.close();
  }
}
