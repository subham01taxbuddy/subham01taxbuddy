import { environment } from 'src/environments/environment';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Injectable} from "@angular/core";
declare var google: any;
declare var gapi: any;

const driveClientId = environment.gdrive.GOOGLE_DRIVE_CLIENT_ID;
const driveApiKey = environment.gdrive.GOOGLE_DRIVE_API_KEY;
@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService{

  driveClientId = environment.gdrive.GOOGLE_DRIVE_CLIENT_ID || '';

  public constructor(private http: HttpClient) {
    console.log('in constructor', this.driveClientId);
  }

  fileUrl: string;
  fileName: string;
  loadGoogleLib(fileName, fileUrl) {

    const client = google.accounts.oauth2.initTokenClient({
      client_id: driveClientId,
      scope: 'https://www.googleapis.com/auth/drive',
      callback: (tokenResponse) => {
        console.log(tokenResponse);
        if (tokenResponse && tokenResponse.access_token) {
          if (google.accounts.oauth2.hasGrantedAnyScope(tokenResponse,
            'https://www.googleapis.com/auth/drive')) {


            gapi.load('client', ()=>{
              gapi.client.setApiKey(driveApiKey);
              gapi.client.setToken(tokenResponse.access_token);

              gapi.client.init({
              }).then(() => {
                const headers = new HttpHeaders();
                this.http.get(fileUrl,{headers, responseType: 'blob' as 'json'}).subscribe(
                  (response: any) =>{
                    let dataType = response.type;
                    let binaryData = [];
                    binaryData.push(response);
                    this.getDriveFiles(fileName, binaryData, dataType);
                  });

              });

            });
          }
        }
      }
    });
    console.log(client);
    client.requestAccessToken();
  }

  searchFolder(){
    var folderName = 'Parser'
    gapi.client.request({
      method:'GET',
      path: `https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.folder' and name='${folderName}'&supportsAllDrives=true&includeItemsFromAllDrives=true`,
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + gapi.client.getToken()
      },
    }).execute((response)=>{});
  }

  getDriveFiles(fileName, fileData, dataType){
    // showStatus("Loading Google Drive files...");
    // gapi.client.init({
    //   apiKey: driveApiKey,
    //   clientId: driveClientId,
    //   discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    //   scope: 'https://www.googleapis.com/auth/drive'
    // });//.then(this.getDriveFiles);
    // gapi.client.load('drive', 'v3', this.createExcelOnDrive2);
    gapi.client.load('drive', 'v3', ()=>{
      const driveId = '0AK1-Qhm_r1YrUk9PVA';

      const fileMetadata = {
        name: fileName,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: folderId ? [folderId] : [],
      };

      //Folder id of Parser Folder on CG Parsing shared drive
      var folderId = "1DlJN6xgPyrX_ijF7k6q4M_1rwiRFJkGt";
      var file = new Blob(fileData, {type: dataType});

      var form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', file);

      // gapi.client.request({
      //   method:'POST',
      //   path: `https://www.googleapis.com/drive/v3/files?uploadType=media&supportsAllDrives=true&driveId=${driveId}`,
      //   'headers': {
      //     'Content-Type': 'application/json',
      //     'Authorization': 'Bearer ' + gapi.client.getToken()
      //   },
      //   body:{
      //     name: fileName,
      //     mimeType: 'application/vnd.google-apps.spreadsheet',
      //     parents: folderId ? [folderId] : [],
      //     metadata: fileMetadata,
      //     file: file
      //   }
      //   // body: form
      // }).execute((response)=>{
      //   console.log('create response', response);
      // });

      const contentType = dataType || 'application/octet-stream';
      const baseRoot = gapi['config'].get('googleapis.config').root;
      const authHeader = 'Bearer ' + gapi.client.getToken();//`Bearer ${gapi.client.getToken()}`;

      const metadataHeaders = {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'X-Upload-Content-Length': file.size,
        'X-Upload-Content-Type': contentType
      };
      // const metadataOptions = new RequestOptions({ headers: new Headers(metadataHeaders) });
      var metadataOptions = new HttpHeaders();
      metadataOptions = metadataOptions.append('Authorization', authHeader);
      metadataOptions = metadataOptions.append('Content-Type', 'application/json');
      metadataOptions = metadataOptions.append('X-Upload-Content-Length', file.size.toString());
      metadataOptions = metadataOptions.append('X-Upload-Content-Type', contentType);

      const url = `${baseRoot}/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true&driveId=${driveId}`;

      const metadata = {
        'name': fileName,
        'mimeType': contentType,
        'Content-Type': contentType,
        'Content-Length': fileData.length
      };

      this.http.post(url, metadata, { headers : metadataOptions }).subscribe((metadataRes: any) => {

        const locationUrl = `https://drive.google.com/file/d/${metadataRes.id}`//metadataRes.headers.get('Location');

        const uploadHeaders = new HttpHeaders();
        uploadHeaders.append('Content-Type', contentType);
        uploadHeaders.append('X-Upload-Content-Type', contentType);
        uploadHeaders.append('Authorization', authHeader);

        // const uploadOptions = new RequestOptions({ headers: new Headers(uploadHeaders) });

        this.http.put(locationUrl, file, {headers: uploadHeaders}).subscribe((uploadRes: any) => {
          console.log(uploadRes.json());
        });
      }, (err) => {
        console.error(err);
      });
          /*return gapi.client.drive.files.create({
            resource: fileMetadata,
            requestBody: {
              name: 'Zerodha.xlsx',
              mimeType: 'application/vnd.google-apps.spreadsheet',
              parents: folderId ? [folderId] : [],
            },
            media: {
              mimeType: 'application/vnd.google-apps.spreadsheet',
              //TODO: add correct stream data
              // body:got.default.stream(fileUrl),
            },
            supportsAllDrives: true,
            driveId: driveId,
          });*/
    });
  }



  //This is used to save file on the drive. Not needed for now
  // saveFile(fileName: string, filePath: string, fileMimeType: string, folderId?: string) {
  //   return this.driveClient.files.create({
  //     requestBody: {
  //       name: fileName,
  //       mimeType: fileMimeType,
  //       parents: folderId ? [folderId] : [],
  //     },
  //     media: {
  //       mimeType: fileMimeType,
  //       body: fs.createReadStream(filePath),
  //     },
  //   });
  // }

  async saveExcel(fileName: string, fileUrl: string, fileMimeType: string, folderId?: string) {

    // const got = await import('got');
    const headers = new HttpHeaders();
    this.http.get(fileUrl,{headers, responseType: 'blob' as 'json'}).subscribe(
      (response: any) =>{
        let dataType = response.type;
        let binaryData = [];
        binaryData.push(response);
        let downloadLink = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
        // if (filename)
        //   downloadLink.setAttribute('download', filename);
        document.body.appendChild(downloadLink);
        downloadLink.click();
      }
    )
    const fileMetadata = {
      name: fileName,
      mimeType: 'application/vnd.google-apps.spreadsheet',
    };

    const driveId = '0AK1-Qhm_r1YrUk9PVA';

    return gapi.client.drive.files.create({
      resource: fileMetadata,
      requestBody: {
        name: fileName,
        mimeType: fileMimeType,
        parents: folderId ? [folderId] : [],
      },
      media: {
        mimeType: fileMimeType,
        //TODO: add correct stream data
        // body:got.default.stream(fileUrl),
      },
      supportsAllDrives: true,
      driveId: driveId,
    });
  }

  async createExcelOnDrive2() {
    // const googleDriveService = new GoogleDriveService();

    const folderName = 'Parser';
    var folder;

    gapi.client.drive.files.list(
      {
        q: ` mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
        // fields: 'files(id, name)',
        // includeItemsFromAllDrives: true,
        supportsAllDrives: true,
        // driveId: driveId,
      }).then(response => {
        // if (err) {
        //   console.log(err);
        // }

        console.log(response)
        folder = (response.data.files ? response.data.files[0] : null);

        const fileMetadata = {
          name: 'Zerodha.xlsx',
          mimeType: 'application/vnd.google-apps.spreadsheet',
        };

        const driveId = '0AK1-Qhm_r1YrUk9PVA';
        var folderId = folder.od;
        return gapi.client.drive.files.create({
          resource: fileMetadata,
          requestBody: {
            name: 'Zerodha.xlsx',
            mimeType: 'application/vnd.google-apps.spreadsheet',
            parents: folderId ? [folderId] : [],
          },
          media: {
            mimeType: 'application/vnd.google-apps.spreadsheet',
            //TODO: add correct stream data
            // body:got.default.stream(fileUrl),
          },
          supportsAllDrives: true,
          driveId: driveId,
        });
      },
    );

    // console.log('creating folder');
    // if (!folder) {
    //   folder = await this.createFolder(folderName);
    // }

    /*console.log('remote file:', this.fileUrl);

    console.log('saving to drive');
    let createdFile = await this.saveExcel('Zerodha.xlsx', this.fileUrl, 'application/vnd.google-apps.spreadsheet', folder.id).catch((error) => {
      console.error(error);
    });

    let redirectUrl = 'https://docs.google.com/spreadsheets/d/' + createdFile.data.id;
    console.info('File uploaded successfully!', createdFile);
    console.info('File available at', redirectUrl);

    window.open(redirectUrl);*/
  }
}
