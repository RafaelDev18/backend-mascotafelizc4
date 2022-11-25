import { service } from '@loopback/core';
import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
  HttpErrors,
} from '@loopback/rest';
import { Llaves } from '../config/llaves';
import { Credenciales, Usuario } from '../models';
import { UsuarioRepository } from '../repositories';
import { AutenticacionService } from '../services';
const fetch = require('node-fetch');

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(AutenticacionService)
    public servicioAutenticacion: AutenticacionService
  ) { }


  @post("/identificarUsuario", {
    responses: {
      '200': {
        description: "Identificacion de usuarios"
      }
    }
  })

  async idetidicarUsuario(
    @requestBody() credenciales: Credenciales
  ) {
    let u = await this.servicioAutenticacion.IdentificarUsuario(credenciales.usuario, credenciales.clave);
    if (u) {
      let token = this.servicioAutenticacion.GenerarTokenJWT(u);
      return {
        datos: {
          nombre: u.nombres,
          email: u.email,
          id: u.id
        },
        tk: token
      }
    } else {
      throw new HttpErrors[401]("Datos invalidos")
    }
  }

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: { 'application/json': { schema: getModelSchemaRef(Usuario) } },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, 'id'>,
  ): Promise<Usuario> {

    //Generar la clave
    let clave = this.servicioAutenticacion.GenerarClave();

    //Encriptar la clave
    let claveCifrada = this.servicioAutenticacion.CifrarClave(clave);

    //Asignar la clave al nuevo usuario
    usuario.clave = claveCifrada;

    //Guardar el  usuario en base de datos
    let u = await this.usuarioRepository.create(usuario);

    //Preparar Correo para el usuario
    let destino = usuario.email;
    let asunto = 'Registro en la plataforma Mascota Feliz';
    let contenido =`Hola ${usuario.nombres} ${usuario.apellidos}, su usuario de ingreso es: ${usuario.email} y su contraseña de ingreso es: ${clave}`
    
    //Enviar correo
    fetch("http://127.0.0.1:5000//envio-correo?cuerpo_correo=" + contenido + "&correo_destino=" + destino + "&asunto_correo=" + asunto)
    //fetch(`${Llaves.urlServicioNotificaciones}/envio-correo?=${destino}&asunto=${asunto}&contenido=${contenido}`)
      .then((data: any) => {
        console.log(data);
      });
    return u;
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, { includeRelations: true }),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: { 'application/json': { schema: CountSchema } },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, { partial: true }),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, { includeRelations: true }),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Usuario, { exclude: 'where' }) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(id, filter);
  }

  @patch('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, { partial: true }),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(id, usuario);
  }

  @put('/usuarios/{id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(id, usuario);
  }

  @del('/usuarios/{id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.usuarioRepository.deleteById(id);
  }
}
