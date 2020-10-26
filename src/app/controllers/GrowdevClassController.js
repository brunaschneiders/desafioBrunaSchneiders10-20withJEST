import GrowdevClass from '../models/GrowdevClass';
import ClassGrowdever from '../models/ClassGrowdever';
import Growdever from '../models/Growdever';
import Cache from '../../lib/Cache';
import User from '../models/User';

class GrowdevClassController {
  async index(req, res) {
    try {
      const { userType } = req;

      if (userType === 'Admin' || userType === 'Growdever') {
        const cache = await Cache.get('classes');
        if (cache) {
          return res.status(200).json({
            success: true,
            classes: JSON.parse(cache),
          });
        }
        const growdevClasses = await GrowdevClass.findAll({
          attributes: ['uid', 'date', 'hour', 'status', 'available_vacancies'],
        });

        if (growdevClasses.length > 0) {
          await Cache.setExpire(
            'classes',
            JSON.stringify(growdevClasses),
            86400
          );
        }

        return res.status(200).json({ success: true, classes: growdevClasses });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível buscar as aulas. Por favor, tente novamente.',
        error: error.message,
      });
    }
  }

  async show(req, res) {
    try {
      const { userType } = req;
      const { uid } = req.params;

      if (uid === 'undefined') {
        throw Error('Aula não encontrada');
      }

      if (userType === 'Admin') {
        const growdevClass = await GrowdevClass.findOne({
          where: { uid },
          attributes: ['uid', 'date', 'hour', 'status', 'available_vacancies'],
          include: [
            {
              model: ClassGrowdever,
              as: 'scheduled_class',
              attributes: ['uid', 'status'],
              include: [
                {
                  model: Growdever,
                  as: 'growdever',
                  include: [
                    {
                      model: User,
                      as: 'user',
                      attributes: ['uid', 'name', 'type', 'username'],
                    },
                  ],
                },
              ],
            },
          ],
        });

        return res.status(200).json({ success: true, growdevClass });
      }
      if (userType === 'Growdever') {
        const growdevClass = await GrowdevClass.findOne({
          where: { uid },
          attributes: ['uid', 'date', 'hour', 'status', 'available_vacancies'],
        });

        return res.status(200).json({ success: true, growdevClass });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível buscar esta aula. Por favor, tente novamente.',
        error: error.message,
      });
    }
  }

  async store(req, res) {
    try {
      const { userType } = req;

      if (userType === 'Admin') {
        const growdevClass = await GrowdevClass.create(req.body);

        await Cache.delete('classes');

        return res.status(200).json({
          success: true,
          message: 'Aula cadastrada com sucesso!',
          growdevClass,
        });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível cadastrar esta aula. Por favor, revise os dados e tente novamente.',
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { userType } = req;

      if (userType === 'Admin') {
        const { uid } = req.params;

        const [growdevClass] = await GrowdevClass.update(req.body, {
          where: { uid },
        });
        if (!growdevClass) {
          return res.status(404).json({
            success: false,
            message: 'Esta aula não foi encontrada.',
          });
        }

        await Cache.delete('classes');

        const { date, hour, status, available_vacancies } = req.body;
        return res.status(200).json({
          success: true,
          message: 'Dados atualizados com sucesso!',
          growdevClass: { date, hour, status, available_vacancies },
        });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível atualizar os dados desta aula. Por favor, revise os dados e tente novamente.',
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { userType } = req;

      if (userType === 'Admin') {
        const { uid } = req.params;

        const deleted = await GrowdevClass.destroy({ where: { uid } });
        if (!deleted) {
          return res
            .status(404)
            .json({ success: false, message: 'Esta aula não foi encontrada.' });
        }

        await Cache.delete('classes');

        return res.status(200).json({
          success: true,
          message: 'Aula cancelada com sucesso!',
        });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível cancelar esta aula. Por favor, tente novamente.',
        error: error.message,
      });
    }
  }
}

export default new GrowdevClassController();
