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

      //this is gapi client way.. excel is created with data
      gapi.client.request({
        method:'POST',
        path: `https://www.googleapis.com/drive/v3/files?uploadType=media&supportsAllDrives=true&driveId=${driveId}`,
        'headers': {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + gapi.client.getToken()
        },
        body:{
          name: fileName,
          mimeType: 'application/vnd.google-apps.spreadsheet',
          parents: folderId ? [folderId] : [],
          metadata: fileMetadata,
          file: file
        }
      }).execute((response)=>{
        console.log('create response', response);
        let fileId = response.id;
        let uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?supportsAllDrives=true`;

        var metadataOptions = new HttpHeaders();
        metadataOptions = metadataOptions.append('Authorization', 'Bearer ' + gapi.client.getToken());
        metadataOptions = metadataOptions.append('Content-Type', 'application/json');
        metadataOptions = metadataOptions.append('X-Upload-Content-Length', file.size.toString());
        metadataOptions = metadataOptions.append('X-Upload-Content-Type', 'application/octet-stream');

        this.http.patch(uploadUrl, file, { headers : metadataOptions }).subscribe((metadataRes: any) => {
          console.log('upload by http', metadataRes);
          window.open(`https://docs.google.com/spreadsheets/d/${metadataRes.id}`);
        });

      });

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
}
