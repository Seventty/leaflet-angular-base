/* import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core'
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
import { FileItem, FileUploader, FileUploaderOptions } from 'ng2-file-upload'
import { ToastrService } from 'ngx-toastr'
import { map, tap } from 'rxjs/operators'
import { environment } from 'src/environments/environment'

@Component({
  selector: 'UIFileUpload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent implements OnInit, ControlValueAccessor {

  @Input() name: string = ''
  @Input() disabled = false
  //Files Configs

  @Input() fileLimit: number = 5
  @Input() fileType: Array<string> = environment.allowedFileTypes
  @Input() maxFileSize: number = environment.appMaxFileSize
  @Input() mimeType: Array<string> = environment.allowedMimeTypes

  @Output() onFileAdded: EventEmitter<any> = new EventEmitter()

  multiple: boolean = false
  selected!: any
  private onTouched: any = () => {}
  private onChanged: any = () => {}

  loading: boolean = false
  uploader?: FileUploader
  hasBaseDropZoneOver = false

  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    this.multiple = this.fileLimit > 1
    this.uploader = new FileUploader({
      isHTML5: true,
      allowedMimeType: this.mimeType,
      allowedFileType: this.fileType,
      queueLimit: this.fileLimit,
      maxFileSize: this.maxFileSize * (Math.pow(1024, 2)),
      url: ''
    })

    this.uploader.onWhenAddingFileFailed = (fileItem, filter: any) => {
      if (filter.name == "mimeType")
        this.toastr.warning(`Uno o varios de los archivos que se están tratando de cargar no son permitidos,
        Estos son los formatos permitidos: ${this.fileType.map(x => x)}`, 'Error')

      if(filter.name == "queueLimit")
        this.toastr.warning(`Solo se permiten ${this.fileLimit} archivo${this.fileLimit > 1 ? 's' : ''}.`, 'Error')

      if(filter.name == "fileSize")
        this.toastr.warning(`El tamaño máximo por archivo es de ${this.maxFileSize}MB.`, 'Error')
    }
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e
  }

  handleFile(element: HTMLElement): void {
    element.click()
  }

  async addedFileToQueue() {
    const files = this.uploader?.queue.map(file => file?._file)
    this.selected = files
    this.onChanged(files)
    this.onTouched()
  }

  async removeFileFromQueue(item: any) {
    item.remove()
    const files = this.uploader?.queue.map(file => file?._file)
    this.selected = files
    this.onChanged(files)
    this.onTouched()
  }

  async toBase64Handler() {
    const filePathsPromises: any[] = [];
    const _uploader = this.uploader
    const fileList = _uploader?.queue
    fileList?.forEach((item: FileItem) => {
      filePathsPromises.push(this.fileToBase64(item));
    });
    const filePaths = await Promise.all(filePathsPromises);
    const mappedFiles = filePaths.map((resultFile) => ({
      fileName: resultFile.fileName,
      base64: resultFile.base64File
    }));
    return mappedFiles;
  }

  fileToBase64(fItem: FileItem): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(fItem._file);
      reader.onload = () => resolve({ base64File: reader.result, fileName: fItem._file.name });
      reader.onerror = error => reject(error);
    });
  }

  //control value accessor
  writeValue(value: any): void {
    this.selected = value ?? null
  }
  registerOnChange(fn: any): void {
    this.onChanged = fn
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

}
 */
