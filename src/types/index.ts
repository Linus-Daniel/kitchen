import { StaticImageData } from "next/image";
export type Option = {
  name:string;
  price:number
}

export interface Product {
      id: string;
      name: string;
      price:number;
      category: string;
      image:string | StaticImageData;
      description: string;
      rating:number;
      cookTime:string
      options:Option[]
      ingredients: string[]
      dietary?:string[]


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
      options:Option[]
      ingredients: string[]
      dietary?:string[]
      selectedOption:Option |null
    };
    

    export type AddToCart =(product:CartItem)=> void |undefined


  export   interface Order {
      _id:string;
      user:{
          name:string;
          email:string;
          
      };
      orderItems:[];
      totalPrice:number;
      status:string;
      createdAt:string;
      isPaid:boolean;
      isDelivered:boolean
  }