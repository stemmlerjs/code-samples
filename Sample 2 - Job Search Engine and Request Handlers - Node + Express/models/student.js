
module.exports = function(sequelize, DataTypes) {
  const Student =  sequelize.define('student', {
    student_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    student_base_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: false,
      unique: true,
      references: {
        model: 'base_user',
        key: 'user_id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade'
    },
    email_pref_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'lists_email_prefs',
        key: 'email_pref_id'
      },
    },
    school_id: {
        type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'school',
          key: 'school_id'
      }
    },
    school_campus_id: {
      type: DataTypes.INTEGER(11),
        allowNull: true,
        references: {
          model: 'school_campus',
          key: 'school_campus_id'
      }
    },
    gender_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'lists_genders',
        key: 'gender_id'
      }
    },
    student_status_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'lists_student_statuses',
        key: 'student_status_id'
      }
    },
    edu_level_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'lists_edu_levels',
        key: 'edu_level_id'
      }
    },
    area_of_study_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'lists_area_of_study',
        key: 'area_of_study_id'
      }
    },
    enroll_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    hobbies: {
      type: DataTypes.STRING,
      allowNull: true
    },
    grad_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    has_car: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    fun_fact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    current_city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    photo_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resume_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    transcript_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recent_company_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    recent_company_position: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gpa: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    program_name: {
      type: DataTypes.STRING(90),
      allowNull: true,
      defaultValue: null
    },
    portfolio_website: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    current_year: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    visible_minority_background_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: "lists_visible_minority_backgrounds",
        key: "visible_minority_background_id"
      }
    },
    indigenous_aboriginal_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: "lists_indigenous_aboriginals",
        key: "indigenous_aboriginal_id"
      }
    },
    about_me: {
      type: DataTypes.STRING(160),
      allowNull: true
    },
    passion: {
      type: DataTypes.STRING(160),
      allowNull: true
    },
    international_student: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    disability: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    coop_program: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    // Preferences.
    // Each of the preferences need to start with
    // "preference" so that we can identify them
    // properly.

    preference_preferred_email: {
      type: DataTypes.STRING(150),
      allowNull: true
    },
    preference_job_search_status_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: "lists_job_search_statuses",
        key: "job_search_statuses_id"
      }
    },
    preference_email_preference_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
      references: {
        model: 'lists_edu_levels',
        key: 'edu_level_id'
      }
    },
    preferred_job_location: {
      type: DataTypes.STRING(100),
      allowNull: true,
    }
  }, {
    timestamps: true,
    underscored: true, // force createdAt, updatedAt => created_at, updated_at
    tableName: 'student'
  });

  /*
   * belongsTo - adds the "foreignKey" to the calling model, targetKey is the key on the other table that we're binding to
   */

  Student.associate = (models) => {

    /*
     * belongsTo () adds the key to the source model / calling model.
     * 
     * These are all relationships that are one to one.
     * Doing this allows you to return all of the associated columns for the related model
     * when we do queries on Student by using the { include: model } options.
     */

    Student.belongsTo(models.BaseUser, { foreignKey: 'student_base_id', targetKey: 'user_id', as: 'BaseUser' })
    Student.belongsTo(models.ListsAreaOfStudy, { foreignKey: 'area_of_study_id', targetKey: 'area_of_study_id', as: 'AreaOfStudy' })
    Student.belongsTo(models.ListsEmailPrefs, 
      { foreignKey: 'email_pref_id', targetKey: 'email_pref_id', as: 'EmailPrefs' }
    )
    Student.belongsTo(models.ListsEmailPrefs, 
      { foreignKey: 'preference_email_preference_id', targetKey: 'email_pref_id', as: 'PreferenceEmailPref' }
    )
    Student.belongsTo(models.School, { foreignKey: 'school_id', targetKey: 'school_id', as: 'School' })
    Student.belongsTo(models.SchoolCampus, { foreignKey: 'school_campus_id', targetKey: 'school_campus_id', as: 'SchoolCampus' })
    Student.belongsTo(models.ListsGenders, { foreignKey: 'gender_id', targetKey: 'gender_id', as: 'Gender' })
    Student.belongsTo(models.ListsStudentStatuses, { foreignKey: 'student_status_id', targetKey: 'student_status_id', as: 'StudentStatus' })
    Student.belongsTo(models.ListsEduLevels, { foreignKey: 'edu_level_id', targetKey: 'edu_level_id', as: 'EduLevel' })
    Student.belongsTo(models.ListsVisibleMinorityBackgrounds, 
      { foreignKey: 'visible_minority_background_id', targetKey: 'visible_minority_background_id', as: 'VisibleMinorityBackground' 
    })
    Student.belongsTo(models.ListsIndigenousAboriginals, 
      { foreignKey: 'indigenous_aboriginal_id', targetKey: 'indigenous_aboriginal_id', as: 'IndigenousAboriginal' 
    })

    Student.belongsTo(models.ListsJobSearchStatuses, 
      { foreignKey: 'preference_job_search_status_id', targetKey: 'job_search_statuses_id', as: 'JobSearchStatus' }
    )

    /*
     * belongsToMany()
     * 
     * We use belongsToMany() when we have to bind junction tables. It makes more sense saying that a user
     * hasMany but we don't have the option to specify through which table with this option.
     * 
     * These are one to many relationships. A student can have many tags.
     * We need to do this here on this model and we also need to do the same thing on the target model.
     */

    Student.belongsToMany(models.ListsLanguages, { as: 'Languages', through: models.TagStudentLanguages, foreignKey: 'student_id'});
    Student.belongsToMany(models.ListsClubs, { as: 'Clubs', through: models.TagStudentClubs, foreignKey: 'student_id'});
    Student.belongsToMany(models.ListsSkills, { as: 'Skills', through: models.TagStudentSkills, foreignKey: 'student_id'});
    Student.belongsToMany(models.ListsSports, { as: 'Sports', through: models.TagStudentSports, foreignKey: 'student_id'});
    Student.belongsToMany(models.ListsJobTypes, 
      { as: 'PreferredJobTypes', through: models.TagsStudentPreferredJobTypes, foreignKey: 'student_id'});

    Student.belongsToMany(models.ListsAppNotificationTypes, 
      { as: 'AppNotifications', through: models.TagStudentAppNotifications, foreignKey: 'student_id'});

    Student.belongsTo(models.Applicant, { foreignKey: 'student_id', sourceKey: 'student_id' });
    Student.hasMany(models.Invite, { foreignKey: 'student_id', sourceKey: 'student_id' });
    Student.hasMany(models.PinnedJob, { foreignKey: 'student_id', sourceKey: 'student_id' });
    Student.hasMany(models.Answer, { foreignKey: 'student_id', sourceKey: 'student_id' });
    Student.hasMany(models.WorkExperience, { foreignKey: 'student_id', sourceKey: 'student_id', as: 'WorkExperience'});

  };

  return Student;
};
