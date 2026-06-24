import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProjectService, IsraProject } from './project.service';
import { ConfigService } from './config.service';

describe('ProjectService', () => {
  let service: ProjectService;
  let httpTestingController: HttpTestingController;
  let configServiceSpy: jasmine.SpyObj<ConfigService>;

  const mockProjects: IsraProject[] = [
    { id: 1, projectName: 'Project One' },
    { id: 2, projectName: 'Project Two' }
  ];

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ConfigService', ['getApiUrl']);
    spy.getApiUrl.and.returnValue('http://localhost:8080');

    TestBed.configureTestingModule({
      providers: [
        ProjectService,
        { provide: ConfigService, useValue: spy },
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ProjectService);
    httpTestingController = TestBed.inject(HttpTestingController);
    configServiceSpy = TestBed.inject(ConfigService) as jasmine.SpyObj<ConfigService>;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created and set activeProject signal to null initially', () => {
    expect(service).toBeTruthy();
    expect(service.activeProject()).toBeNull();
  });

  it('should fetch projects via GET', () => {
    service.getProjects().subscribe(projects => {
      expect(projects).toEqual(mockProjects);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects');
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects);
  });

  it('should fetch a single project via GET', () => {
    service.getProject(1).subscribe(project => {
      expect(project).toEqual(mockProjects[0]);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockProjects[0]);
  });

  it('should create a project via POST', () => {
    const newProject: IsraProject = { projectName: 'New Project' };
    const savedProject: IsraProject = { id: 3, projectName: 'New Project' };

    service.createProject(newProject).subscribe(project => {
      expect(project).toEqual(savedProject);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newProject);
    req.flush(savedProject);
  });

  it('should update a project via PUT', () => {
    const updatedProject: IsraProject = { projectName: 'Updated Project' };

    service.updateProject(1, updatedProject).subscribe(project => {
      expect(project).toEqual({ id: 1, ...updatedProject });
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedProject);
    req.flush({ id: 1, ...updatedProject });
  });

  it('should delete a project via DELETE', () => {
    service.deleteProject(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should update project context via PUT', () => {
    const context = { desc: 'Some context' };
    const updatedProject: IsraProject = { id: 1, projectName: 'Project One', projectContext: context };

    service.updateProjectContext(1, context).subscribe(project => {
      expect(project).toEqual(updatedProject);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/context');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(context);
    req.flush(updatedProject);
  });

  it('should upload context attachment via POST', () => {
    const file = new File(['file contents'], 'test.txt', { type: 'text/plain' });
    const updatedProject: IsraProject = { id: 1, projectName: 'Project One' };

    service.uploadContextAttachment(1, file).subscribe(project => {
      expect(project).toEqual(updatedProject);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/context/attachment');
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(updatedProject);
  });

  it('should download context attachment as Blob via GET', () => {
    const mockBlob = new Blob(['blob contents'], { type: 'application/octet-stream' });

    service.downloadContextAttachment(1).subscribe(blob => {
      expect(blob).toEqual(mockBlob);
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/projects/1/context/attachment');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(mockBlob);
  });
});
