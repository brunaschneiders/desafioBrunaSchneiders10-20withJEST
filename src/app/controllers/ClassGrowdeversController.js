import ClassGrowdever from '../models/ClassGrowdever';
import GrowdevClass from '../models/GrowdevClass';
import Cache from '../../lib/Cache';
import Growdever from '../models/Growdever';

class ClassGrowdeverController {
  async store(req, res) {
    const t = await ClassGrowdever.sequelize.transaction();

    try {
      const { userType } = req;

      if (userType === 'Admin' || userType === 'Growdever') {
        const { growdever_uid, class_uid } = req.body;

        const classData = await GrowdevClass.findByPk(class_uid);
        const growdeverData = await Growdever.findOne({
          where: { uid: growdever_uid },
          include: [
            {
              model: ClassGrowdever,
              as: 'scheduled_classes',
              attributes: ['uid', 'status'],
              include: [{ model: GrowdevClass, as: 'class' }],
            },
          ],
        });
        const schedules = growdeverData?.dataValues?.scheduled_classes;
        const scheduledClasses = schedules.map((schedule) => schedule.class);
        const classAlreadyScheduled = scheduledClasses.filter(
          (growdevClass) => growdevClass.uid === class_uid
        );
        if (classAlreadyScheduled.length === 0) {
          const classAvailableVacancies =
            classData?.dataValues?.available_vacancies;
          if (classAvailableVacancies > 0) {
            const classGrowdever = await ClassGrowdever.create(req.body, {
              transaction: t,
            });

            await GrowdevClass.update(
              {
                available_vacancies: classAvailableVacancies - 1,
              },
              {
                where: { uid: class_uid },
              },
              { transaction: t }
            );

            await t.commit();

            await Cache.delete('classes');

            return res.status(200).json({
              success: true,
              message: 'Agendamento realizado com sucesso!',
            });
          }

          return res.status(404).json({
            success: false,
            message: 'Não há mais vagas disponíveis para esta aula.',
          });
        }
        return res.status(404).json({
          success: false,
          message: 'Você já está inscrito nesta aula.',
        });
      }
      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      await t.rollback();

      return res.status(404).json({
        success: false,
        message:
          'Não foi possível realizar este cadastro. Por favor, revise os dados e tente novamente.',
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    const t = await ClassGrowdever.sequelize.transaction();
    try {
      const { userType } = req;

      if (userType === 'Admin' || userType === 'Growdever') {
        const { uid } = req.params;

        const scheduleData = await ClassGrowdever.findByPk(uid);
        const scheduleClassUid = scheduleData.dataValues.class_uid;
        const scheduleClassData = await GrowdevClass.findByPk(scheduleClassUid);
        const classAvailableVacancies =
          scheduleClassData?.dataValues?.available_vacancies;

        await GrowdevClass.update(
          {
            available_vacancies: classAvailableVacancies + 1,
          },
          {
            where: { uid: scheduleClassUid },
          },
          { transaction: t }
        );

        const deleted = await ClassGrowdever.destroy(
          { where: { uid } },
          { transaction: t }
        );
        if (!deleted) {
          return res.status(404).json({
            success: false,
            message: 'Este agendamento não foi encontrado.',
          });
        }

        await t.commit();
        await Cache.delete('classes');

        return res.status(200).json({
          success: true,
          message: 'Agendamento cancelado com sucesso!',
        });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      await t.rollback();
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível cancelar este agendamento. Por favor, tente novamente.',
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { userType } = req;

      if (userType === 'Admin') {
        const { uid } = req.params;

        const [scheduledClass] = await ClassGrowdever.update(req.body, {
          where: { uid },
        });
        if (!scheduledClass) {
          return res.status(404).json({
            success: false,
            message: 'Este agendamento não foi encontrado.',
          });
        }

        await Cache.delete('classes');

        const { status } = req.body;
        return res.status(200).json({
          success: true,
          message: 'Dados atualizados com sucesso!',
          scheduledClass: { status },
        });
      }

      return res
        .status(403)
        .json({ success: false, message: 'Acesso Negado.' });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          'Não foi possível atualizar os dados deste agendamento. Por favor, revise os dados e tente novamente.',
        error: error.message,
      });
    }
  }
}

export default new ClassGrowdeverController();
