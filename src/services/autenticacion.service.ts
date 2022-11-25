import {injectable, /* inject, */ BindingScope} from '@loopback/core';
import { repository } from '@loopback/repository';
import { Usuario } from '../models';
import { UsuarioRepository } from '../repositories';
import { Llaves } from '../config/llaves';
const generador = require("password-generator");
const cryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

@injectable({scope: BindingScope.TRANSIENT})
export class AutenticacionService {
  constructor(
  @repository(UsuarioRepository)
  public usuarioRepository: UsuarioRepository
  ) {}

  /*
   * Add service methods here
   */

  //metodo para generar de forma aleatoria la clave del usuario
  GenerarClave(){
    let clave = generador(8, false); //aqui se define  la longitud y complejidad de la clave
    return clave;
  }

  //metodo para cifrar la clave
  CifrarClave(clave:string){
    let claveCifrada = cryptoJS.MD5(clave).toString();
    return claveCifrada;
    }

  IdentificarUsuario(usuario:string, clave:string){
    try{
      let u = this.usuarioRepository.findOne({where:{email: usuario, clave: clave}})
      if(u){
        return u;
      }
      return false;
    }catch{
      return false;
    }
  }

  GenerarTokenJWT(usuario: Usuario){
    let token = jwt.sign({
      // se puede agragar un tiempo de expiracion
      data:{
        id: usuario.id,
        nombre: usuario.nombres + " " + usuario.apellidos,
        email: usuario.email
        //rol: usuario.rol "Cliente" "Admin" "Asesor"
        // se pueden agragar mas propiedades del usuario para el token
      },
    },
    Llaves.claveJWT);
    return token;
  }
  ValidarTokenJWT(token:string){
    try{
      let datos = jwt.verify(token, Llaves.claveJWT);
      return datos;
    }catch{
      return false;
    }
  }
}
