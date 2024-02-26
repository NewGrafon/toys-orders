import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateToyComponent } from './create-toy.component';

describe('CreateToyComponent', () => {
  let component: CreateToyComponent;
  let fixture: ComponentFixture<CreateToyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateToyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateToyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
