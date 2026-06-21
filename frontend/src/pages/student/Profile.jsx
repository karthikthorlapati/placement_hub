import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { studentApi } from '../../api'

const Profile = () => {
  const [profile, setProfile] = useState(null)
  const [completion, setCompletion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const [profileData, completionData] = await Promise.all([
        studentApi.getProfile(),
        studentApi.getProfileCompletion()
      ])
      setProfile(profileData)
      setCompletion(completionData)
      setForm({
        name: profileData.name || '',
        phone: profileData.phone || '',
        cgpa: profileData.cgpa || '',
        resumeLink: profileData.resumeLink || '',
        skills: profileData.skills || '',
        linkedin: profileData.linkedin || '',
        github: profileData.github || '',
        department: profileData.department || ''
      })
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    setMsg('')
    setErr('')

    if (form.department !== profile.department) {
      const confirmed = window.confirm(
        `Warning: You are changing your department from "${profile.department}" to "${form.department}". This will change which companies and announcements you see! Are you sure you want to continue?`
      )
      if (!confirmed) {
        return
      }
    }

    try {
      const res = await studentApi.updateProfile(form)
      if (res.message === 'Profile updated successfully!') {
        setMsg('Profile updated successfully! ✅')
        setEditing(false)
        loadProfile()
      } else {
        setErr(res.message)
      }
    } catch (error) {
      setErr('Something went wrong!')
    }
  }

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return '#2ecc71'
    if (percentage >= 50) return '#f39c12'
    return '#e74c3c'
  }

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className='page-title'>👤 My Profile</h2>

      {msg && <div className='success-msg'>{msg}</div>}
      {err && <div className='error-msg'>{err}</div>}

      {/* Profile Completion */}
      {completion && (
        <div className='section'>
          <h3>📊 Profile Completion</h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '15px'
          }}>
            <div style={{
              flex: 1,
              background: '#f0f0f0',
              borderRadius: '10px',
              height: '20px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${completion.percentage}%`,
                background: getCompletionColor(completion.percentage),
                height: '100%',
                borderRadius: '10px',
                transition: 'width 0.5s ease'
              }} />
            </div>
            <span style={{
              fontWeight: 'bold',
              color: getCompletionColor(completion.percentage),
              minWidth: '45px'
            }}>
              {completion.percentage}%
            </span>
          </div>

          {completion.missing.length > 0 && (
            <div style={{
              background: '#fff3cd',
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #ffc107'
            }}>
              <p style={{
                color: '#856404',
                fontSize: '13px',
                marginBottom: '5px',
                fontWeight: 'bold'
              }}>
                Complete your profile to improve visibility:
              </p>
              <p style={{ color: '#856404', fontSize: '13px' }}>
                Missing: {completion.missing.join(', ')}
              </p>
            </div>
          )}

          {completion.percentage === 100 && (
            <div style={{
              background: '#d4edda',
              padding: '10px 15px',
              borderRadius: '8px',
              border: '1px solid #28a745'
            }}>
              <p style={{ color: '#28a745', fontWeight: 'bold' }}>
                🎉 Profile 100% Complete!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Profile Info */}
      {!editing ? (
        <div className='section'>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3>Personal Information</h3>
            <button
              className='btn-primary'
              onClick={() => setEditing(true)}
            >
              ✏️ Edit Profile
            </button>
          </div>

          <div style={{ display: 'grid', gap: '15px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '15px'
            }}>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  Full Name
                </p>
                <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {profile?.name || 'N/A'}
                </p>
              </div>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#7f8c8d', fontSize: '12px' }}>Email</p>
                <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {profile?.email || 'N/A'}
                </p>
              </div>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  Department
                </p>
                <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {profile?.department || 'N/A'}
                </p>
              </div>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  Roll Number
                </p>
                <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {profile?.rollNumber || 'N/A'}
                </p>
              </div>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#7f8c8d', fontSize: '12px' }}>Phone</p>
                <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                  {profile?.phone || 'N/A'}
                </p>
              </div>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#7f8c8d', fontSize: '12px' }}>CGPA</p>
                <p style={{
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  fontSize: '18px'
                }}>
                  {profile?.cgpa || 'N/A'}
                </p>
              </div>
            </div>

            {/* Skills */}
            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <p style={{ color: '#7f8c8d', fontSize: '12px' }}>Skills</p>
              <p style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                {profile?.skills || 'Not added yet'}
              </p>
            </div>

            {/* Links */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '15px'
            }}>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  Resume
                </p>
                {profile?.resumeLink ? (
                  <a
                    href={profile.resumeLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{
                      color: '#3498db',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    📄 View Resume
                  </a>
                ) : (
                  <p style={{ color: '#e74c3c', fontSize: '13px' }}>
                    Not added
                  </p>
                )}
              </div>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#7f8c8d', fontSize: '12px' }}>
                  LinkedIn
                </p>
                {profile?.linkedin ? (
                  <a
                    href={profile.linkedin}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{
                      color: '#0077b5',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    🔗 LinkedIn
                  </a>
                ) : (
                  <p style={{ color: '#e74c3c', fontSize: '13px' }}>
                    Not added
                  </p>
                )}
              </div>
              <div style={{
                background: '#f8f9fa',
                padding: '15px',
                borderRadius: '8px'
              }}>
                <p style={{ color: '#7f8c8d', fontSize: '12px' }}>GitHub</p>
                {profile?.github ? (
                  <a
                    href={profile.github}
                    target='_blank'
                    rel='noopener noreferrer'
                    style={{
                      color: '#333',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}
                  >
                    💻 GitHub
                  </a>
                ) : (
                  <p style={{ color: '#e74c3c', fontSize: '13px' }}>
                    Not added
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Edit Form */
        <div className='section'>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3>Edit Profile</h3>
            <button
              className='btn-danger'
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label>Full Name</label>
              <input
                type='text'
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
              />
            </div>
            <div className='form-group'>
              <label>Phone</label>
              <input
                type='text'
                value={form.phone}
                onChange={e => setForm({...form, phone: e.target.value})}
              />
            </div>
          </div>

          <div className='form-group'>
            <label>
              Department{' '}
              <span style={{
                color: '#e74c3c',
                fontSize: '11px',
                marginLeft: '8px'
              }}>
                ⚠️ Change carefully — affects which companies you see!
              </span>
            </label>
            <input
              type='text'
              placeholder='e.g. CSE, ECE, AIML'
              value={form.department}
              onChange={e => setForm({
                ...form, department: e.target.value.toUpperCase()
              })}
            />
          </div>

          <div className='form-group'>
            <label>CGPA</label>
            <input
              type='number'
              value={form.cgpa}
              onChange={e => setForm({...form, cgpa: e.target.value})}
              min='0'
              max='10'
              step='0.01'
            />
          </div>

          <div className='form-group'>
            <label>Skills (comma separated)</label>
            <input
              type='text'
              placeholder='e.g. React, Node.js, MongoDB, Python'
              value={form.skills}
              onChange={e => setForm({...form, skills: e.target.value})}
            />
          </div>

          <div className='form-group'>
            <label>Resume Link (Google Drive / PDF link)</label>
            <input
              type='url'
              placeholder='e.g. https://drive.google.com/file/your-resume'
              value={form.resumeLink}
              onChange={e => setForm({...form, resumeLink: e.target.value})}
            />
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label>LinkedIn Profile</label>
              <input
                type='url'
                placeholder='e.g. https://linkedin.com/in/yourname'
                value={form.linkedin}
                onChange={e => setForm({...form, linkedin: e.target.value})}
              />
            </div>
            <div className='form-group'>
              <label>GitHub Profile</label>
              <input
                type='url'
                placeholder='e.g. https://github.com/yourname'
                value={form.github}
                onChange={e => setForm({...form, github: e.target.value})}
              />
            </div>
          </div>

          <button className='btn-primary' onClick={handleUpdate}>
            💾 Save Changes
          </button>
        </div>
      )}

    </Layout>
  )
}

export default Profile