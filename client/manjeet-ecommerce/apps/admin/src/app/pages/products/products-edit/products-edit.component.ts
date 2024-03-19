import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { timer } from 'rxjs';

import { CategoriesResponse, CategoriesService, Category, ProductResponse, ProductService } from '@manjeet-ecommerce/products';
import { SuccessResponse } from '../../categories/category-edit/category-edit.component';

@Component({
  selector: 'admin-products-list',
  templateUrl: './products-edit.component.html',
  styles: [],
})
export class ProductsEditComponent implements OnInit {
  editMode = false;
  submitted = false;
  isLoading = false;
  isError = false;
  productForm: FormGroup;
  productGalleryForm: FormGroup;
  categories: Category[] = [];
  imagePreview: string | ArrayBuffer;
  productId: string;
  images: string[] = [];

  constructor(private fb: FormBuilder, private categoryService: CategoriesService, private messageService: MessageService, private productService: ProductService, private location: Location, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this._initForm();
    this.activatedRoute.params.subscribe((param: Params) => {
      if (param['id']) {
        this.editMode = true;
        this.productId = param['id'];
        this._getProduct(this.productId);
        this._getCategories();
        this.f['image'].setValidators(null);
        this.f['image'].updateValueAndValidity();
      }
      else {
        this.editMode = false;
        this.productId = '';
        this._getCategories();
      }
    })
  }

  get f() {
    return this.productForm.controls;
  }

  private _initForm() {
    this.productForm = this.fb.group({
      name: new FormControl(null, [Validators.required]),
      brand: new FormControl(null, [Validators.required]),
      price: new FormControl(null, [Validators.required]),
      category: new FormControl(null, [Validators.required]),
      countInStock: new FormControl(null, [Validators.required]),
      description: new FormControl(null, [Validators.required]),
      richDescription: new FormControl(null),
      image: new FormControl(null, [Validators.required]),
      images: new FormControl(null),
      isFeatured: new FormControl(false),
    });

    this.productGalleryForm = this.fb.group({
      images: new FormControl(null)
    })
  }

  private _getCategories() {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe(
      (res: CategoriesResponse) => {
        this.categories = res['categories'];
        this.isLoading = false;
        this.isError = false;
      },
      (err) => {
        this.isLoading = false;
        this.isError = true;
        this._errorHandler(err);
      }
    );
  }

  private _postProduct(productForm: FormData) {
    this.productService.postProduct(productForm).subscribe(
      (res: SuccessResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
          // this.router.navigate(['/categories']);
          timer(1000).toPromise().then(() => {
            this.location.back();
          })
        }
      },
      (err) => {
        this.isLoading = false;
        this.isError = true;
        this._errorHandler(err);
      }
    );
  }

  private _getProduct(productId: string) {
    this.isLoading = true;
    this.productService.getProduct(productId).subscribe((res: ProductResponse) => {
      this.productForm.patchValue({
        name: res.product.name,
        brand: res.product.brand,
        price: res.product.price,
        category: res.product.category._id,
        countInStock: res.product.countInStock,
        description: res.product.description,
        richDescription: res.product.richDescription,
        isFeatured: res.product.isFeatured
      });
      this.imagePreview = res.product.image;
      this.images = res.product.images;
      this.isLoading = false;
      this.isError = false;
    }, err => {
      this.isLoading = false;
      this.isError = true;
      this._errorHandler(err);
    });
  }

  private _updateProduct(product: FormData) {
    this.productService.updateProduct(this.productId, product).subscribe(
      (res: SuccessResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
          // this.router.navigate(['/categories']);
          timer(1000).toPromise().then(() => {
            this.location.back();
          })
        }
      },
      (err) => {
        this.isLoading = false;
        this.isError = true;
        this._errorHandler(err);
      }
    );
  }

  onSubmitForm() {
    this.submitted = true;
    if (!this.productForm.valid) return;
    this.isLoading = true;
    const productFormData = new FormData();
    Object.keys(this.f).map(key => {
      // console.log(key+': ' + this.f[key].value);
      productFormData.append(key, this.f[key].value);
    })
    if (this.editMode) {
      this._updateProduct(productFormData);
    }
    else {
      this._postProduct(productFormData);
    }
  }

  onImageSelect(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.productForm.patchValue({
        image: file
      });
      this.productForm.get('image')?.updateValueAndValidity();
      const fileReader = new FileReader();
      fileReader.onload = () => {
        this.imagePreview = fileReader.result as string;
      }
      fileReader.readAsDataURL(file);
    }
  }

  onGalleyImagesSelect(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (files) {
      this.productGalleryForm.patchValue({
        images: files
      });
      this.productGalleryForm.get('images')?.updateValueAndValidity();

      for (let i = 0; i <= files.length; i++) {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
          this.images.push(fileReader.result as string);
        }
        if(files[i]){
          fileReader.readAsDataURL(files[i]);
        }
      }
    }
  }

  private _updateGalleryOfProduct(product: FormData) {
    this.productService.updateGalleryOfProduct(this.productId, product).subscribe(
      (res: SuccessResponse) => {
        this.isLoading = false;
        this.isError = false;
        if (res.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: res['message'] });
          // this.router.navigate(['/categories']);
          // timer(1000).toPromise().then(() => {
          //   this.location.back();
          // })
        }
      },
      (err) => {
        this.isLoading = false;
        this.isError = true;
        this._errorHandler(err);
      }
    );
  }

  onSubmitGalleryForm() {
    this.submitted = true;
    if (!this.productGalleryForm.valid) return;
    this.isLoading = true;
    const productFormData = new FormData();
    if(this.productGalleryForm.controls['images'].value) {
      const filesLength: number = this.productGalleryForm.controls['images'].value.length;
      for (let i = 0; i <= filesLength; i++) {
        productFormData.append('images', this.productGalleryForm.controls['images'].value[i]);
      }
      if (this.editMode) {
        this._updateGalleryOfProduct(productFormData);
      }
    }
  }

  private _errorHandler(err: HttpErrorResponse) {
    if (err.error['message']) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: err.error['message'],
      });

    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'An error occured',
        detail: 'Please try again!',
      });
    }
  }
}
