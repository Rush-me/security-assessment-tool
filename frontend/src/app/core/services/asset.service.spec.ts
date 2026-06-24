import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AssetService, BusinessAsset, SupportingAsset } from './asset.service';
import { ConfigService } from './config.service';

describe('AssetService', () => {
  let service: AssetService;
  let httpTestingController: HttpTestingController;

  const mockBusinessAsset: BusinessAsset = {
    id: 10,
    assetId: 1,
    assetName: 'Main Database',
    confidentiality: 5,
    integrity: 5,
    availability: 5,
    authenticity: 5,
    authorization: 5,
    nonRepudiation: 5
  };

  const mockSupportingAsset: SupportingAsset = {
    id: 20,
    assetId: 2,
    assetName: 'AWS S3',
    businessAssets: [mockBusinessAsset]
  };

  beforeEach(() => {
    const configSpy = jasmine.createSpyObj('ConfigService', ['getApiUrl']);
    configSpy.getApiUrl.and.returnValue('http://localhost:8080');

    TestBed.configureTestingModule({
      providers: [
        AssetService,
        { provide: ConfigService, useValue: configSpy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AssetService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Business Assets
  it('should fetch business assets', () => {
    const assets = [mockBusinessAsset];
    service.getBusinessAssets(1).subscribe(res => expect(res).toEqual(assets));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/business-assets');
    expect(req.request.method).toBe('GET');
    req.flush(assets);
  });

  it('should add a business asset', () => {
    service.addBusinessAsset(1, mockBusinessAsset).subscribe(res => expect(res).toEqual(mockBusinessAsset));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/business-assets');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockBusinessAsset);
    req.flush(mockBusinessAsset);
  });

  it('should update a business asset', () => {
    service.updateBusinessAsset(1, 10, mockBusinessAsset).subscribe(res => expect(res).toEqual(mockBusinessAsset));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/business-assets/10');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockBusinessAsset);
    req.flush(mockBusinessAsset);
  });

  it('should delete a business asset', () => {
    service.deleteBusinessAsset(1, 10).subscribe(res => expect(res).toBeNull());

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/business-assets/10');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // Supporting Assets
  it('should fetch supporting assets', () => {
    const assets = [mockSupportingAsset];
    service.getSupportingAssets(1).subscribe(res => expect(res).toEqual(assets));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/supporting-assets');
    expect(req.request.method).toBe('GET');
    req.flush(assets);
  });

  it('should add a supporting asset', () => {
    service.addSupportingAsset(1, mockSupportingAsset).subscribe(res => expect(res).toEqual(mockSupportingAsset));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/supporting-assets');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockSupportingAsset);
    req.flush(mockSupportingAsset);
  });

  it('should update a supporting asset', () => {
    service.updateSupportingAsset(1, 20, mockSupportingAsset).subscribe(res => expect(res).toEqual(mockSupportingAsset));

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/supporting-assets/20');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockSupportingAsset);
    req.flush(mockSupportingAsset);
  });

  it('should delete a supporting asset', () => {
    service.deleteSupportingAsset(1, 20).subscribe(res => expect(res).toBeNull());

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/supporting-assets/20');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
