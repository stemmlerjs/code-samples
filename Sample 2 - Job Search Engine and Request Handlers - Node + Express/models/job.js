
module.exports = function(sequelize, DataTypes) {
  const Job =  sequelize.define('job', {
    job_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    employer_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'employer',
        key: 'employer_id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    },
    title: {
      type: DataTypes.STRING(30),
      allowNull: false
    },
    job_type_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      references: {
        model: 'lists_job_types',
        key: 'job_type_id'
      }
    },
    paid: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    closing_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    responsibilities: {
      type: DataTypes.STRING(5500),
      allowNull: true
    },
    qualification: {
      type: DataTypes.STRING(1400),
      allowNull: true
    },
    compensation: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(55),
      allowNull: true
    },
    max_applicants: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    remote_work: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    num_positions: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },

    /**
     * Redundancy required to searching
     */

    company_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    // Paid Job stuff
    paid_job_type: {
      type: DataTypes.STRING(50),
      allowNull: true,
      defaultValue: null
    },
    paid_job_range_min: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null
    },
    paid_job_range_max: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null
    },
    paid_job_set_value: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      defaultValue: null
    },
    paid_job_work_unit: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null
    },
    slug: {
      type: DataTypes.STRING(65),
      allowNull: true
    },
    parent_job_id: {
      type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'job',
          key: 'job_id'
      }
    },
    linkback_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    linkback_url: {
      type: DataTypes.STRING(150),
      allowNull: true
    }
  },{
    // needs to be underscored  == false because createdat and updatedat are default created
    // and they are camelcase.
    timestamps: true,
    underscored: true, // force createdat, updatedat => created_at, updated_at
    tableName: 'job',
    instanceMethods: {

    }
  });

  Job.associate = (models) => {

    /*
     * belongsTo()
     * 
     * {
     *   foreignKey: foreign key on the source model binding it to the target model
     *   targetKey: foreign key on the target model
     * }
     */

    Job.belongsTo(models.Employer, { foreignKey: 'employer_id', targetKey: 'employer_id', as: 'Employer' });
    Job.belongsTo(models.ListsJobTypes, { as: 'JobType', foreignKey : 'job_type_id', targetId: 'job_type_id' });
    
    /*
     * belongsToMany()
     * 
     * We use belongsToMany() when we have to bind junction tables. It makes more sense saying that a user
     * hasMany but we don't have the option to specify through which table with this option.
     * 
     * These are one to many relationships. A student can have many tags.
     * We need to do this here on this model and we also need to do the same thing on the other model.
     */
    
    Job.belongsToMany(models.ListsSkills, { as: 'DesiredSkills', through: models.TagDesiredSkills, foreignKey: 'job_id'});
    
    /*
     * Straight relationships, foreign key relationships directly to the target
     * model.
     */

    Job.hasMany(models.Question, { as: 'Questions', foreignKey: 'job_id', sourceKey: 'job_id' })
    Job.hasMany(models.Answer, { as: 'Answers', foreignKey: 'job_id' });
    Job.hasMany(models.PinnedJob, { as: 'PinnedJob', foreignKey: 'job_id' });
    Job.hasMany(models.Applicant, { as: 'Applicants', foreignKey: 'job_id' });
    Job.hasMany(models.Invite, { as: 'Invites', foreignKey: 'job_id' });
    Job.hasMany(models.JmViews, { as: 'Views', foreignKey: 'job_id' });
    Job.hasMany(models.JmLinkbackClicks, { as: 'LinkbackClicks', foreignKey: 'job_id' });
    Job.hasMany(models.JmSocialSharesFb, { as: 'FacebookShares', foreignKey: 'job_id' });
    Job.hasMany(models.JmSocialSharesTwitter, { as: 'TwitterShares', foreignKey: 'job_id' });
    Job.hasMany(models.JmSocialSharesLinkedin, { as: 'LinkedinShares', foreignKey: 'job_id' });

  }

  return Job;
};
