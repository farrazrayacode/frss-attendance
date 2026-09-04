import { Sequelize } from 'sequelize';
import logger from '@/utils/logger';
import userModel from './models/user.model';
import roleModel from './models/role.model';
import monitoringModel from './models/monitoring.model';
import alertModel from './models/alert.model';
import recordingModel from './models/recording.model';
import { NODE_ENV } from '@/config';
import path from 'path';

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage:
        process.env.SQLITE_PATH ||
        path.resolve(__dirname, '../../../sv-fs.sqlite'),
    logging:
        NODE_ENV === 'development'
            ? (query, time) => logger.info(`${time}ms ${query}`)
            : false,
    benchmark: true,
    define: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_general_ci',
        underscored: true,
        freezeTableName: true,
    },
});

export const DB = {
    Users: userModel(sequelize),
    Roles: roleModel(sequelize),
    Monitoring: monitoringModel(sequelize),
    Alerts: alertModel(sequelize),
    Recordings: recordingModel(sequelize),
    sequelize,
    Sequelize,
};

DB.Users.belongsTo(DB.Roles, { foreignKey: 'role_id', as: 'role' });
DB.Recordings.belongsTo(DB.Monitoring, {
    foreignKey: 'camera_id',
    as: 'camera',
});

(async () => {
    try {
        await sequelize.authenticate();
        logger.info('SQLite database connected ✅');

        // Gunakan sync biasa tanpa alter: true untuk SQLite
        await sequelize.sync();
        logger.info('Tables synced ✅');

        await seedDefaultData();
    } catch (error: any) {
        // Log detail validasi Sequelize jika ada
        if (error.errors && Array.isArray(error.errors)) {
            error.errors.forEach((err: any) => {
                logger.error(
                    `Validation detail: ${err.message} on field "${err.path}" with value "${err.value}"`,
                );
            });
        } else {
            logger.error('Database init failed ❌', error);
        }
    }
})();

async function seedDefaultData() {
    try {
        const bcrypt = await import('bcrypt');

        // 1. Ambil atau Buat Role Admin
        let adminRole = await DB.Roles.findOne({ where: { name: 'admin' } });
        if (!adminRole) {
            adminRole = await DB.Roles.create({
                name: 'admin',
                description: 'Administrator with full access',
                permissions: ['all'],
            } as any);
            logger.info('Default admin role created ✅');
        }

        // 2. Ambil atau Buat Default User Admin
        const existing = await DB.Users.findOne({
            where: { email: 'admin@admin.com' },
        });

        if (!existing) {
            const hashed = await bcrypt.hash('Admin123!', 10);
            await DB.Users.create({
                name: 'Admin',
                email: 'admin@admin.com',
                username: 'admin',
                password: hashed,
                roleId: Number(adminRole.id),
                isApproved: true,
                department: 'IT',
                isOnline: false,
            } as any);
            logger.info(
                'Default admin user created ✅ (admin@admin.com / Admin123!)',
            );
        }
    } catch (err: any) {
        logger.error('Error during seeding default data:', err);
    }
}
