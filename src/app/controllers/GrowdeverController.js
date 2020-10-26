import ClassGrowdever from '../models/ClassGrowdever';
import GrowdevClass from '../models/GrowdevClass';
import Growdever from '../models/Growdever';
import User from '../models/User';
import Cache from '../../lib/Cache';

class GrowdeverController {
  async index(req, res) {
    try {
      const cache = await Cache.get('growdevers');

      const { userType } = req;

      if (userType === 'Admin') {
        if (cache) {
          return res.status(200).json({
            success: true,
            growdevers: JSON.parse(cache),
          });
        }

        const growdevers = await Growdever.findAll({
          attributes: ['uid', 'email', 'phone', 'program'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['uid', 'name', 'type', 'username'],
            },
            {
              model: ClassGrowdever,
              as: 'scheduled_classes',
              attributes: ['uid', 'status'],
              include: [{ model: GrowdevClass, as: 'class' }],
            },
          ],
        });

        if (growdevers.length > 0) {
          await Cache.setExpire(
            'growdevers',
            JSON.stringify(growdevers),
            86400
          );
        }

        return res.status(200).json({ success: true, growdevers });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível buscar os dados dos Growdevers. Por favor, tente novamente.',
        error: error.messages,
      });
    }
  }

  async show(req, res) {
    try {
      const { userType, userUid } = req;
      const { uid } = req.params;

      if (userType === 'Admin') {
        const growdever = await Growdever.findOne({
          where: { uid },
          attributes: ['uid', 'email', 'phone', 'program'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['uid', 'name', 'type', 'username'],
            },
            {
              model: ClassGrowdever,
              as: 'scheduled_classes',
              attributes: ['uid', 'status'],
              include: [{ model: GrowdevClass, as: 'class' }],
            },
          ],
        });

        return res.status(200).json({ success: true, growdever });
      }
      if (userType === 'Growdever') {
        const growdever = await Growdever.findOne({
          where: { uid },
          attributes: ['uid', 'email', 'phone', 'program'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['uid', 'name', 'type', 'username'],
            },
            {
              model: ClassGrowdever,
              as: 'scheduled_classes',
              attributes: ['uid', 'status'],
              include: [{ model: GrowdevClass, as: 'class' }],
            },
          ],
        });

        if (growdever.user.dataValues.uid === userUid) {
          return res.status(200).json({ success: true, growdever });
        }

        return res
          .status(403)
          .json({ success: false, message: 'Acesso Negado.' });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível buscar os dados deste Growdever. Por favor, tente novamente.',
        error: error.message,
      });
    }
  }

  async store(req, res) {
    try {
      const { userType } = req;

      if (userType === 'Admin') {
        const growdever = await Growdever.create(req.body);

        await Cache.delete('users');
        await Cache.delete('growdevers');

        return res.status(200).json({
          success: true,
          message: 'Growdever cadastrado com sucesso!',
          growdever,
        });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível cadastrar o Growdever. Por favor, revise os dados e tente novamente.',
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { userType, userUid } = req;
      const { uid } = req.params;
      if (userType === 'Admin') {
        const [growdever] = await Growdever.update(req.body, {
          where: { uid },
        });
        if (!growdever) {
          return res.status(404).json({
            success: false,
            message: 'Este Growdever não foi encontrado.',
          });
        }

        const { email, phone, program } = req.body;

        await Cache.delete('users');
        await Cache.delete('growdevers');

        return res.status(200).json({
          success: true,
          message: 'Dados atualizados com sucesso!',
          growdever: { email, phone, program },
        });
      }
      if (userType === 'Growdever') {
        const growdeverToBeUpdate = await Growdever.findOne({
          where: { uid },
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['uid'],
            },
          ],
        });

        const userUidToBeUpdate = growdeverToBeUpdate?.user?.dataValues?.uid;
        if (userUid === userUidToBeUpdate) {
          const [growdever] = await Growdever.update(req.body, {
            where: { uid },
          });
          if (!growdever) {
            return res.status(404).json({
              success: false,
              message: 'Este Growdever não foi encontrado.',
            });
          }

          const { email, phone, program } = req.body;

          await Cache.delete('users');
          await Cache.delete('growdevers');

          return res.status(200).json({
            success: true,
            message: 'Dados atualizados com sucesso!',
            growdever: { email, phone, program },
          });
        }
        return res
          .status(403)
          .json({ success: false, message: 'Acesso Negado.' });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível atualizar os dados do Growdever. Por favor, revise os dados e tente novamente.',
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { userType } = req;

      if (userType === 'Admin') {
        const { uid } = req.params;

        const deleted = await Growdever.destroy({ where: { uid } });

        if (!deleted) {
          return res.status(404).json({
            success: false,
            message: 'Este Growdever não foi encontrado.',
          });
        }

        await Cache.delete('users');
        await Cache.delete('growdevers');

        return res.status(200).json({
          success: true,
          message: 'Growdever deletado com sucesso!',
        });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível deletar este Growdever. Por favor, tente novamente.',
        error: error.message,
      });
    }
  }
}

export default new GrowdeverController();
