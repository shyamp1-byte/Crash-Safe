import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'user_profile',
          columns: [
            { name: 'profile_picture', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});
