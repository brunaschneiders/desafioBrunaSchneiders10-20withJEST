import Growdever from '../models/Growdever';
import User from '../models/User';
import Cache from '../../lib/Cache';

class UserController {
  async index(req, res) {
    try {
      const cache = await Cache.get('users');

      const { userType } = req;
      if (userType === 'Admin') {
        if (cache) {
          return res.status(200).json({
            success: true,
            users: JSON.parse(cache),
          });
        }

        const users = await User.findAll({
          attributes: ['uid', 'name', 'type', 'username'],
          include: [
            {
              model: Growdever,
              as: 'growdever',
              attributes: ['uid', 'email', 'phone', 'program'],
            },
          ],
        });

        if (users.length > 0) {
          await Cache.setExpire('users', JSON.stringify(users), 86400);
        }

        return res.status(200).json({ success: true, users });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível buscar os usuários. Por favor, tente novamente.',
        error: error.message,
      });
    }
  }

  async show(req, res) {
    try {
      const { userType, userUid } = req;
      const { uid } = req.params;

      if (uid === 'undefined') {
        throw Error('Usuário não encontrado');
      }

      if (userType === 'Admin') {
        const user = await User.findOne({
          where: { uid },
          attributes: ['uid', 'name', 'type', 'username'],
          include: [
            {
              model: Growdever,
              as: 'growdever',
              attributes: ['uid', 'email', 'phone', 'program'],
            },
          ],
        });

        return res.status(200).json({ success: true, user });
      }
      if (userType === 'Growdever' && userUid === uid) {
        const user = await User.findOne({
          where: { uid },
          attributes: ['uid', 'name', 'type', 'username'],
          include: [
            {
              model: Growdever,
              as: 'growdever',
              attributes: ['uid', 'email', 'phone', 'program'],
            },
          ],
        });

        return res.status(200).json({ success: true, user });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível buscar este usuário. Por favor, tente novamente.',
        error: error.message,
      });
    }
  }

  async store(req, res) {
    try {
      const { username } = req.body;

      const userExist = await User.findOne({ where: { username } });
      if (userExist) {
        return res.status(404).json({
          success: false,
          message: 'Usuário já cadastrado.',
        });
      }

      const user = await User.create(req.body);

      await Cache.delete('users');

      return res.status(200).json({
        success: true,
        message: 'Usuário cadastrado com sucesso!',
        user,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível cadastrar o Usuário. Por favor, revise os dados e tente novamente.',
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { uid } = req.params;
      const { username, oldPassword } = req.body;

      const user = await User.findByPk(uid);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado.',
        });
      }
      if (username !== user.username) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado.',
        });
      }

      if (oldPassword && !(await user.checkPassword(oldPassword))) {
        return res
          .status(404)
          .json({ success: false, message: 'Senha inválida.' });
      }

      const { name, type } = await user.update(req.body);

      await Cache.delete('users');

      return res.status(200).json({
        success: true,
        message: 'Senha atualizada com sucesso!',
        user: { uid, name, type, username },
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível atualizar a senha. Por favor, tente novamente.',
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { userType } = req;

      if (userType === 'Admin') {
        const { uid } = req.params;

        const deleted = await User.destroy({ where: { uid } });

        if (!deleted) {
          return res.status(404).json({
            success: false,
            message: 'Este usuário não foi encontrado.',
          });
        }

        await Cache.delete('users');
        await Cache.delete('growdevers');

        return res.status(200).json({
          success: true,
          message: 'Usuário deletado com sucesso!',
        });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível deletar este usuário. Por favor, tente novamente.',
        error: error.message,
      });
    }
  }
}

export default new UserController();
