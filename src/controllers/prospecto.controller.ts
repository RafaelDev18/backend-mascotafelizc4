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
} from '@loopback/rest';
import fetch from 'node-fetch';
import {Prospecto} from '../models';
import {ProspectoRepository} from '../repositories';

export class ProspectoController {
  constructor(
    @repository(ProspectoRepository)
    public prospectoRepository : ProspectoRepository,
  ) {}

  @post('/prospectos')
  @response(200, {
    description: 'Prospecto model instance',
    content: {'application/json': {schema: getModelSchemaRef(Prospecto)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prospecto, {
            title: 'NewProspecto',
            exclude: ['id'],
          }),
        },
      },
    })
    prospecto: Omit<Prospecto, 'id'>,
  ): Promise<Prospecto> {
    //return this.prospectoRepository.create(prospecto);
    let p = await this.prospectoRepository.create(prospecto);

    //Preparar Correo
    let destino = "rafael.rico.18@hotmail.com";//usuario.email;
    let asunto = `Contacto de ${prospecto.nombres} ${prospecto.apellidos}`;
    let contenido = `Hola, el prospecto ${prospecto.nombres} ${prospecto.apellidos} ha dejado el siguiente comentario: ${prospecto.comentario}. Por favor responder al email ${prospecto.email} o al teléfono ${prospecto.telefono}.`;

    fetch("https://mensajeria-prod-mensajeria-mfc4-2vlmxr.mo6.mogenius.io/envio-correo?cuerpo_correo=" + contenido + "&correo_destino=" + destino + "&asunto_correo=" + asunto)

      .then((data: any)=>{
        console.log(data);
      })
    return p;

  }

  @get('/prospectos/count')
  @response(200, {
    description: 'Prospecto model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Prospecto) where?: Where<Prospecto>,
  ): Promise<Count> {
    return this.prospectoRepository.count(where);
  }

  @get('/prospectos')
  @response(200, {
    description: 'Array of Prospecto model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Prospecto, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Prospecto) filter?: Filter<Prospecto>,
  ): Promise<Prospecto[]> {
    return this.prospectoRepository.find(filter);
  }

  @patch('/prospectos')
  @response(200, {
    description: 'Prospecto PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prospecto, {partial: true}),
        },
      },
    })
    prospecto: Prospecto,
    @param.where(Prospecto) where?: Where<Prospecto>,
  ): Promise<Count> {
    return this.prospectoRepository.updateAll(prospecto, where);
  }

  @get('/prospectos/{id}')
  @response(200, {
    description: 'Prospecto model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Prospecto, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Prospecto, {exclude: 'where'}) filter?: FilterExcludingWhere<Prospecto>
  ): Promise<Prospecto> {
    return this.prospectoRepository.findById(id, filter);
  }

  @patch('/prospectos/{id}')
  @response(204, {
    description: 'Prospecto PATCH success',
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Prospecto, {partial: true}),
        },
      },
    })
    prospecto: Prospecto,
  ): Promise<void> {
    await this.prospectoRepository.updateById(id, prospecto);
  }

  @put('/prospectos/{id}')
  @response(204, {
    description: 'Prospecto PUT success',
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() prospecto: Prospecto,
  ): Promise<void> {
    await this.prospectoRepository.replaceById(id, prospecto);
  }

  @del('/prospectos/{id}')
  @response(204, {
    description: 'Prospecto DELETE success',
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.prospectoRepository.deleteById(id);
  }
}
