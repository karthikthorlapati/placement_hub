import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import { studentApi } from '../../api'

const Profile = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    department: '',
    rollNumber: '',
    phone: '',
    cgpa: ''
  })
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [profileMsg, setProfileMsg] = useState('')
  const [profileErr, setProfileErr] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passErr, setPassErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await studentApi.getProfile()
      setProfile({
        name: data.name || '',
        email: data.email || '',
        department: data.department || '',
        rollNumber: data.rollNumber || '',
        phone: data.phone || '',
        cgpa: data.cgpa || ''
      })
    } catch (error) {
      console.log('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    setProfileMsg('')
    setProfileErr('')
    try {
      const res = await studentApi.updateProfile({
        name: profile.name,
        phone: profile.phone,
        department: profile.department,
        rollNumber: profile.rollNumber,
        cgpa: parseFloat(profile.cgpa) || 0
      })

      if (res.message === 'Profile updated successfully!') {
        setProfileMsg('Profile updated successfully! ✅')
        localStorage.setItem('user', JSON.stringify({
          ...JSON.parse(localStorage.getItem('user')),
          name: profile.name
        }))
      } else {
        setProfileErr(res.message)
      }
    } catch (error) {
      setProfileErr('Something went wrong!')
    }
  }

  const handleChangePassword = async () => {
    setPassMsg('')
    setPassErr('')

    if (newPassword !== confirmPassword) {
      setPassErr('Passwords do not match!')
      return
    }

    if (newPassword.length < 6) {
      setPassErr('Password must be at least 6 characters!')
      return
    }

    try {
      const res = await studentApi.changePassword({
        oldPassword,
        newPassword
      })

      if (res.message === 'Password changed successfully!') {
        setPassMsg('Password changed successfully! ✅')
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPassErr(res.message)
      }
    } catch (error) {
      setPassErr('Something went wrong!')
    }
  }

  if (loading) return (
    <Layout>
      <div className='loading'>Loading...</div>
    </Layout>
  )

  return (
    <Layout>
      <h2 className='page-title'>👤 My Profile</h2>

      {/* Update Profile */}
      <div className='section'>
        <h3>Update Profile</h3>

        {profileMsg && <div className='success-msg'>{profileMsg}</div>}
        {profileErr && <div className='error-msg'>{profileErr}</div>}

        <div className='form-row'>
          <div className='form-group'>
            <label>Full Name</label>
            <input
              type='text'
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
              placeholder='Your full name'
            />
          </div>
          <div className='form-group'>
            <label>Email</label>
            <input
              type='email'
              value={profile.email}
              disabled
              style={{ background: '#f5f6fa' }}
            />
          </div>
        </div>

        <div className='form-row'>
          <div className='form-group'>
            <label>Department</label>
            <input
              type='text'
              value={profile.department}
              onChange={e => setProfile({
                ...profile, department: e.target.value
              })}
              placeholder='Your department'
            />
          </div>
          <div className='form-group'>
            <label>Roll Number</label>
            <input
              type='text'
              value={profile.rollNumber}
              onChange={e => setProfile({
                ...profile, rollNumber: e.target.value
              })}
              placeholder='Your roll number'
            />
          </div>
        </div>

        <div className='form-row'>
          <div className='form-group'>
            <label>Phone Number</label>
            <input
              type='text'
              value={profile.phone}
              onChange={e => setProfile({
                ...profile, phone: e.target.value
              })}
              placeholder='Your phone number'
            />
          </div>
          <div className='form-group'>
            <label>CGPA</label>
            <input
              type='number'
              value={profile.cgpa}
              onChange={e => setProfile({
                ...profile, cgpa: e.target.value
              })}
              placeholder='Your CGPA'
              min='0'
              max='10'
              step='0.1'
            />
          </div>
        </div>

        <button className='btn-primary' onClick={handleUpdateProfile}>
          Update Profile
        </button>
      </div>

      {/* Change Password */}
      <div className='section'>
        <h3>🔒 Change Password</h3>

        {passMsg && <div className='success-msg'>{passMsg}</div>}
        {passErr && <div className='error-msg'>{passErr}</div>}

        <div className='form-group'>
          <label>Old Password</label>
          <input
            type='password'
            value={oldPassword}
            onChange={e => setOldPassword(e.target.value)}
            placeholder='Enter old password'
          />
        </div>
        <div className='form-group'>
          <label>New Password</label>
          <input
            type='password'
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder='Enter new password'
          />
        </div>
        <div className='form-group'>
          <label>Confirm New Password</label>
          <input
            type='password'
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder='Confirm new password'
          />
        </div>

        <button className='btn-primary' onClick={handleChangePassword}>
          Change Password
        </button>
      </div>

    </Layout>
  )
}

export default Profile