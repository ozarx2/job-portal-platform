import React, { useState } from 'react';
import { Loader, Sparkles, X } from 'lucide-react';

const ResumeBuilder = () => {
  // State for form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    jobTitle: '',
    experience: '',
    industry: '',
    targetRole: '',
    skills: [],
    workExperience: [],
    projects: [],
    achievements: [],
    education: '',
    certifications: [],
    resumeStyle: 'professional',
    includeExamples: false,
    includeStatistics: false
  });

  // State for input fields
  const [skillInput, setSkillInput] = useState('');
  const [achievementInput, setAchievementInput] = useState('');
  const [workExpInput, setWorkExpInput] = useState({
    title: '',
    company: '',
    duration: '',
    description: ''
  });
  const [projectInput, setProjectInput] = useState({
    name: '',
    technologies: '',
    link: '',
    description: ''
  });
  const [certificationInput, setCertificationInput] = useState({
    name: '',
    issuer: '',
    date: '',
    credentialId: ''
  });

  // State for generated content
  const [generatedTexts, setGeneratedTexts] = useState({
    summary: '',
    skills: '',
    workExperience: {},
    projects: {},
    achievements: '',
    education: ''
  });
  const [generatedContent, setGeneratedContent] = useState(null);
  const [loading, setLoading] = useState(false);

  // Helper function to handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Skills management
  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Work experience management
  const addWorkExperience = () => {
    if (workExpInput.title.trim() && workExpInput.company.trim()) {
      setFormData(prev => ({
        ...prev,
        workExperience: [...prev.workExperience, { ...workExpInput }]
      }));
      setWorkExpInput({ title: '', company: '', duration: '', description: '' });
    }
  };

  const removeWorkExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter((_, i) => i !== index)
    }));
  };

  // Project management
  const addProject = () => {
    if (projectInput.name.trim()) {
      setFormData(prev => ({
        ...prev,
        projects: [...prev.projects, { ...projectInput }]
      }));
      setProjectInput({ name: '', technologies: '', link: '', description: '' });
    }
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Achievement management
  const addAchievement = () => {
    if (achievementInput.trim() && !formData.achievements.includes(achievementInput.trim())) {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievementInput.trim()]
      }));
      setAchievementInput('');
    }
  };

  const removeAchievement = (index) => {
    setFormData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  // Certification management
  const addCertification = () => {
    if (certificationInput.name.trim() && certificationInput.issuer.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, { ...certificationInput }]
      }));
      setCertificationInput({ name: '', issuer: '', date: '', credentialId: '' });
    }
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  // Generate functions (mock implementations - replace with actual AI calls)
  const generateProfessionalSummary = async () => {
    setLoading(true);
    try {
      // Mock AI generation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockSummary = `Experienced ${formData.jobTitle} with ${formData.experience} years in ${formData.industry}. Proven track record of delivering high-quality solutions and driving business growth. Strong expertise in ${formData.skills.slice(0, 3).join(', ')} and passionate about ${formData.targetRole} opportunities.`;
      setGeneratedTexts(prev => ({ ...prev, summary: mockSummary }));
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSkillsText = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockSkillsText = `Proficient in ${formData.skills.join(', ')} with hands-on experience in developing scalable solutions and implementing best practices.`;
      setGeneratedTexts(prev => ({ ...prev, skills: mockSkillsText }));
    } catch (error) {
      console.error('Error generating skills text:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateWorkExperienceText = async (index) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const exp = formData.workExperience[index];
      const mockExpText = `Led key initiatives at ${exp.company} as ${exp.title}, focusing on strategic improvements and team collaboration. Delivered measurable results through innovative problem-solving and technical expertise.`;
      setGeneratedTexts(prev => ({
        ...prev,
        workExperience: { ...prev.workExperience, [index]: mockExpText }
      }));
    } catch (error) {
      console.error('Error generating work experience text:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateProjectText = async (index) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const project = formData.projects[index];
      const mockProjectText = `Developed ${project.name} using ${project.technologies}, demonstrating strong technical skills and attention to detail. Successfully delivered a robust solution that improved user experience and system performance.`;
      setGeneratedTexts(prev => ({
        ...prev,
        projects: { ...prev.projects, [index]: mockProjectText }
      }));
    } catch (error) {
      console.error('Error generating project text:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAchievementsText = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockAchievementsText = `Notable accomplishments include: ${formData.achievements.join('; ')}. These achievements demonstrate consistent performance excellence and commitment to delivering outstanding results.`;
      setGeneratedTexts(prev => ({ ...prev, achievements: mockAchievementsText }));
    } catch (error) {
      console.error('Error generating achievements text:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEducationText = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockEducationText = `${formData.education} - Acquired comprehensive knowledge and skills relevant to ${formData.industry} with focus on practical application and continuous learning.`;
      setGeneratedTexts(prev => ({ ...prev, education: mockEducationText }));
    } catch (error) {
      console.error('Error generating education text:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    return (
      <div className="space-y-6">
        {/* Personal Information Section */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 p-6 rounded-lg border border-teal-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) => handleInputChange('linkedin', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website/Portfolio</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>
        </div>

        {/* Professional Summary Section */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 p-6 rounded-lg border border-teal-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Professional Summary
            </h3>
            <button
              onClick={generateProfessionalSummary}
              disabled={loading || !formData.jobTitle.trim()}
              className="flex items-center px-3 py-2 text-sm bg-gradient-to-r from-teal-600 to-orange-600 text-white rounded-lg hover:from-teal-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              Generate Summary
            </button>
          </div>
          
          {generatedTexts.summary && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-teal-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Generated Summary:</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{generatedTexts.summary}</p>
              <button
                onClick={() => setGeneratedTexts(prev => ({ ...prev, summary: '' }))}
                className="mt-2 text-xs text-teal-600 hover:text-teal-800"
              >
                Clear
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., Software Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
              <select
                value={formData.experience}
                onChange={(e) => handleInputChange('experience', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Select experience</option>
                <option value="0-1">0-1 years</option>
                <option value="2-3">2-3 years</option>
                <option value="4-5">4-5 years</option>
                <option value="6-10">6-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => handleInputChange('targetRole', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="e.g., Senior Developer"
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 p-6 rounded-lg border border-teal-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Skills
            </h3>
            <button
              onClick={generateSkillsText}
              disabled={loading || !formData.skills.length}
              className="flex items-center px-3 py-2 text-sm bg-gradient-to-r from-teal-600 to-orange-600 text-white rounded-lg hover:from-teal-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              Generate Skills
            </button>
          </div>
          
          {generatedTexts.skills && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-teal-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Generated Skills Description:</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{generatedTexts.skills}</p>
              <button
                onClick={() => setGeneratedTexts(prev => ({ ...prev, skills: '' }))}
                className="mt-2 text-xs text-teal-600 hover:text-teal-800"
              >
                Clear
              </button>
            </div>
          )}
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Add a skill (e.g., JavaScript, React, Python)"
            />
            <button
              onClick={addSkill}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Add
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800"
              >
                {skill}
                <button
                  onClick={() => removeSkill(index)}
                  className="ml-2 text-teal-600 hover:text-teal-800"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Work Experience Section */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 p-6 rounded-lg border border-teal-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" />
            </svg>
            Work Experience
          </h3>
          
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                <input
                  type="text"
                  value={workExpInput.title}
                  onChange={(e) => setWorkExpInput(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <input
                  type="text"
                  value={workExpInput.company}
                  onChange={(e) => setWorkExpInput(prev => ({ ...prev, company: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., Tech Corp"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={workExpInput.duration}
                  onChange={(e) => setWorkExpInput(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., Jan 2020 - Present"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addWorkExperience}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Add Experience
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={workExpInput.description}
                onChange={(e) => setWorkExpInput(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                rows={3}
                placeholder="Describe your responsibilities and achievements..."
              />
            </div>
          </div>
          
          {formData.workExperience.map((exp, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                  <p className="text-sm text-gray-600">{exp.company} • {exp.duration}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateWorkExperienceText(index)}
                    disabled={loading}
                    className="flex items-center px-2 py-1 text-xs bg-gradient-to-r from-teal-600 to-orange-600 text-white rounded hover:from-teal-700 hover:to-orange-700 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generate
                  </button>
                  <button
                    onClick={() => removeWorkExperience(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {generatedTexts.workExperience[index] && (
                <div className="mt-2 p-3 bg-teal-50 rounded border border-teal-200">
                  <p className="text-sm text-gray-700">{generatedTexts.workExperience[index]}</p>
                </div>
              )}
              {exp.description && (
                <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Projects Section */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 p-6 rounded-lg border border-teal-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Projects
          </h3>
          
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  value={projectInput.name}
                  onChange={(e) => setProjectInput(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., E-commerce Website"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                <input
                  type="text"
                  value={projectInput.technologies}
                  onChange={(e) => setProjectInput(prev => ({ ...prev, technologies: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., React, Node.js, MongoDB"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
                <input
                  type="url"
                  value={projectInput.link}
                  onChange={(e) => setProjectInput(prev => ({ ...prev, link: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="https://github.com/username/project"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addProject}
                  className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                >
                  Add Project
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={projectInput.description}
                onChange={(e) => setProjectInput(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                rows={3}
                placeholder="Describe the project, your role, and key achievements..."
              />
            </div>
          </div>
          
          {formData.projects.map((project, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-gray-900">{project.name}</h4>
                  {project.technologies && (
                    <p className="text-sm text-gray-600">Technologies: {project.technologies}</p>
                  )}
                  {project.link && (
                    <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:text-teal-800">
                      View Project →
                    </a>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateProjectText(index)}
                    disabled={loading}
                    className="flex items-center px-2 py-1 text-xs bg-gradient-to-r from-teal-600 to-orange-600 text-white rounded hover:from-teal-700 hover:to-orange-700 disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Generate
                  </button>
                  <button
                    onClick={() => removeProject(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {generatedTexts.projects[index] && (
                <div className="mt-2 p-3 bg-teal-50 rounded border border-teal-200">
                  <p className="text-sm text-gray-700">{generatedTexts.projects[index]}</p>
                </div>
              )}
              {project.description && (
                <p className="text-sm text-gray-600 mt-2">{project.description}</p>
              )}
            </div>
          ))}
        </div>

        {/* Achievements Section */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 p-6 rounded-lg border border-teal-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              Achievements
            </h3>
            <button
              onClick={generateAchievementsText}
              disabled={loading || !formData.achievements.length}
              className="flex items-center px-3 py-2 text-sm bg-gradient-to-r from-teal-600 to-orange-600 text-white rounded-lg hover:from-teal-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              Generate Achievements
            </button>
          </div>
          
          {generatedTexts.achievements && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-teal-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Generated Achievements:</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{generatedTexts.achievements}</p>
              <button
                onClick={() => setGeneratedTexts(prev => ({ ...prev, achievements: '' }))}
                className="mt-2 text-xs text-teal-600 hover:text-teal-800"
              >
                Clear
              </button>
            </div>
          )}
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={achievementInput}
              onChange={(e) => setAchievementInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Add an achievement (e.g., Increased sales by 30%)"
            />
            <button
              onClick={addAchievement}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
            >
              Add
            </button>
          </div>
          
          <div className="space-y-2">
            {formData.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                <span className="text-sm text-gray-700">{achievement}</span>
                <button
                  onClick={() => removeAchievement(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Education Section */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 p-6 rounded-lg border border-teal-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.083 12.083 0 01.665-6.479L12 14z" />
              </svg>
              Education
            </h3>
            <button
              onClick={generateEducationText}
              disabled={loading || !formData.education.trim()}
              className="flex items-center px-3 py-2 text-sm bg-gradient-to-r from-teal-600 to-orange-600 text-white rounded-lg hover:from-teal-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? (
                <Loader className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1" />
              )}
              Generate Education
            </button>
          </div>
          
          {generatedTexts.education && (
            <div className="mb-4 p-4 bg-white rounded-lg border border-teal-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Generated Education Description:</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{generatedTexts.education}</p>
              <button
                onClick={() => setGeneratedTexts(prev => ({ ...prev, education: '' }))}
                className="mt-2 text-xs text-teal-600 hover:text-teal-800"
              >
                Clear
              </button>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Education Details</label>
            <textarea
              value={formData.education}
              onChange={(e) => handleInputChange('education', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              rows={3}
              placeholder="e.g., Bachelor of Science in Computer Science, University Name, 2020"
            />
          </div>
        </div>

        {/* Certifications Section */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 p-6 rounded-lg border border-teal-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Certifications
          </h3>
          
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                <input
                  type="text"
                  value={certificationInput.name}
                  onChange={(e) => setCertificationInput(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., AWS Certified Solutions Architect"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                <input
                  type="text"
                  value={certificationInput.issuer}
                  onChange={(e) => setCertificationInput(prev => ({ ...prev, issuer: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., Amazon Web Services"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="text"
                  value={certificationInput.date}
                  onChange={(e) => setCertificationInput(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., Dec 2023"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID (Optional)</label>
                <input
                  type="text"
                  value={certificationInput.credentialId}
                  onChange={(e) => setCertificationInput(prev => ({ ...prev, credentialId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="e.g., AWS-123456"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={addCertification}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Add Certification
              </button>
            </div>
          </div>
          
          {formData.certifications.map((cert, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                  <p className="text-sm text-gray-600">{cert.issuer} • {cert.date}</p>
                  {cert.credentialId && (
                    <p className="text-xs text-gray-500">ID: {cert.credentialId}</p>
                  )}
                </div>
                <button
                  onClick={() => removeCertification(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Resume Style Options */}
        <div className="bg-gradient-to-r from-teal-50 to-orange-50 p-6 rounded-lg border border-teal-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
            <svg className="w-5 h-5 mr-2 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
            </svg>
            Resume Style Options
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume Style</label>
              <select
                value={formData.resumeStyle}
                onChange={(e) => handleInputChange('resumeStyle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="professional">Professional</option>
                <option value="modern">Modern</option>
                <option value="creative">Creative</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeExamples}
                  onChange={(e) => handleInputChange('includeExamples', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Examples</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.includeStatistics}
                  onChange={(e) => handleInputChange('includeStatistics', e.target.checked)}
                  className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include Statistics</span>
              </label>
            </div>
          </div>
        </div>

        {/* Generate Resume Button */}
        <div className="text-center">
          <button
            onClick={() => setGeneratedContent("Resume generated successfully!")}
            className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-teal-600 to-orange-600 text-white rounded-lg hover:from-teal-700 hover:to-orange-700 shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            Generate Complete Resume
          </button>
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    if (!generatedContent) return null;

    return (
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center bg-gradient-to-r from-teal-50 to-orange-50 p-6 rounded-lg border border-teal-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {formData.fullName || 'Professional Name'}
          </h1>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            {formData.email && <span>📧 {formData.email}</span>}
            {formData.phone && <span>📞 {formData.phone}</span>}
            {formData.location && <span>📍 {formData.location}</span>}
            {formData.linkedin && <span>💼 <a href={formData.linkedin} className="text-teal-600 hover:text-teal-800">LinkedIn</a></span>}
            {formData.website && <span>🌐 <a href={formData.website} className="text-teal-600 hover:text-teal-800">Portfolio</a></span>}
          </div>
          <div className="mt-2">
            <span className="text-lg font-semibold text-teal-600">
              {formData.jobTitle || 'Professional Title'}
            </span>
          </div>
        </div>

        {/* Professional Summary */}
        {generatedTexts.summary && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-teal-500 pb-2">Professional Summary</h2>
            <p className="text-gray-700 leading-relaxed">{generatedTexts.summary}</p>
          </div>
        )}

        {/* Skills */}
        {formData.skills.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-teal-500 pb-2">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.skills.map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
            {generatedTexts.skills && (
              <p className="text-gray-700 leading-relaxed">{generatedTexts.skills}</p>
            )}
          </div>
        )}

        {/* Work Experience */}
        {formData.workExperience.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-teal-500 pb-2">Work Experience</h2>
            <div className="space-y-4">
              {formData.workExperience.map((exp, index) => (
                <div key={index} className="border-l-4 border-teal-500 pl-4">
                  <h3 className="font-semibold text-gray-900">{exp.title}</h3>
                  <p className="text-teal-600 font-medium">{exp.company} • {exp.duration}</p>
                  {generatedTexts.workExperience[index] && (
                    <p className="text-gray-700 mt-2 leading-relaxed">{generatedTexts.workExperience[index]}</p>
                  )}
                  {exp.description && (
                    <p className="text-gray-600 mt-2 text-sm">{exp.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {formData.projects.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-teal-500 pb-2">Projects</h2>
            <div className="space-y-4">
              {formData.projects.map((project, index) => (
                <div key={index} className="border-l-4 border-teal-500 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      {project.technologies && (
                        <p className="text-sm text-gray-600">Technologies: {project.technologies}</p>
                      )}
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" 
                           className="text-teal-600 hover:text-teal-800 text-sm">
                          View Project →
                        </a>
                      )}
                    </div>
                  </div>
                  {generatedTexts.projects[index] && (
                    <p className="text-gray-700 mt-2 leading-relaxed">{generatedTexts.projects[index]}</p>
                  )}
                  {project.description && (
                    <p className="text-gray-600 mt-2 text-sm">{project.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Achievements */}
        {formData.achievements.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-teal-500 pb-2">Achievements</h2>
            <div className="space-y-2">
              {formData.achievements.map((achievement, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-teal-600 mr-2">•</span>
                  <p className="text-gray-700">{achievement}</p>
                </div>
              ))}
            </div>
            {generatedTexts.achievements && (
              <div className="mt-3 p-3 bg-teal-50 rounded border border-teal-200">
                <p className="text-gray-700 leading-relaxed">{generatedTexts.achievements}</p>
              </div>
            )}
          </div>
        )}

        {/* Education */}
        {formData.education.trim() && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-teal-500 pb-2">Education</h2>
            <p className="text-gray-700 leading-relaxed">{formData.education}</p>
            {generatedTexts.education && (
              <div className="mt-3 p-3 bg-teal-50 rounded border border-teal-200">
                <p className="text-gray-700 leading-relaxed">{generatedTexts.education}</p>
              </div>
            )}
          </div>
        )}

        {/* Certifications */}
        {formData.certifications.length > 0 && (
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b-2 border-teal-500 pb-2">Certifications</h2>
            <div className="space-y-3">
              {formData.certifications.map((cert, index) => (
                <div key={index} className="border-l-4 border-teal-500 pl-4">
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-teal-600 font-medium">{cert.issuer} • {cert.date}</p>
                  {cert.credentialId && (
                    <p className="text-gray-500 text-sm">Credential ID: {cert.credentialId}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Resume Builder</h1>
          <p className="text-lg text-gray-600">Create a professional resume with AI-powered content generation</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Information</h2>
            {renderForm()}
          </div>
          
          {/* Preview Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Resume Preview</h2>
            {generatedContent ? (
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                {renderPreview()}
              </div>
            ) : (
              <div className="bg-gray-100 p-12 rounded-lg border border-gray-200 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Resume Preview</h3>
                <p className="text-gray-500">Fill in your information and click "Generate Complete Resume" to see the preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder
