import { StaticImageData } from "next/image";

export interface Product {
      id: number;
      name: string;
      price:number;
      category: string;
      image:string | StaticImageData;
      description: string;
      rating:number;
      cookTime:string
    }


    export interface CartItem  {
      quantity: number;
      id: number;
      name: string;
      price:number;
      category: string;
      image:string | StaticImageData;
      description: string;
      rating:number;
      cookTime:string
    };
    