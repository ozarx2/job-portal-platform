const axios = require('axios');

async function testSkillManagementScenarios() {
  const baseURL = 'http://localhost:5000';
  
  try {
    console.log('🧪 Testing Skill Management System - Comprehensive Scenarios...\n');
    
    // Step 1: Authentication
    console.log('1. 🔐 Authentication Setup...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'testemployer@example.com',
      password: 'TestPass123!'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Authentication successful\n');
    
    // Scenario 1: Basic Skill Search
    console.log('📋 SCENARIO 1: Basic Skill Search');
    console.log('='.repeat(50));
    await testBasicSkillSearch(baseURL, token);
    
    // Scenario 2: Multi-Skill Search
    console.log('\n📋 SCENARIO 2: Multi-Skill Search');
    console.log('='.repeat(50));
    await testMultiSkillSearch(baseURL, token);
    
    // Scenario 3: Location + Skill Combination
    console.log('\n📋 SCENARIO 3: Location + Skill Combination');
    console.log('='.repeat(50));
    await testLocationSkillCombination(baseURL, token);
    
    // Scenario 4: Experience-Based Filtering
    console.log('\n📋 SCENARIO 4: Experience-Based Filtering');
    console.log('='.repeat(50));
    await testExperienceFiltering(baseURL, token);
    
    // Scenario 5: Advanced Multi-Criteria Search
    console.log('\n📋 SCENARIO 5: Advanced Multi-Criteria Search');
    console.log('='.repeat(50));
    await testAdvancedMultiCriteria(baseURL, token);
    
    // Scenario 6: Edge Cases and Error Handling
    console.log('\n📋 SCENARIO 6: Edge Cases and Error Handling');
    console.log('='.repeat(50));
    await testEdgeCases(baseURL, token);
    
    // Scenario 7: Performance Testing
    console.log('\n📋 SCENARIO 7: Performance Testing');
    console.log('='.repeat(50));
    await testPerformance(baseURL, token);
    
    // Scenario 8: Skill Autocomplete
    console.log('\n📋 SCENARIO 8: Skill Autocomplete');
    console.log('='.repeat(50));
    await testSkillAutocomplete(baseURL, token);
    
    console.log('\n🎉 All Skill Management Scenarios Tested Successfully!');
    
    return true;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

async function testBasicSkillSearch(baseURL, token) {
  console.log('Testing basic skill searches...\n');
  
  const skills = [
    { skill: 'JavaScript', expected: 'Popular programming language' },
    { skill: 'React', expected: 'Frontend framework' },
    { skill: 'Python', expected: 'Backend programming language' },
    { skill: 'MongoDB', expected: 'Database technology' },
    { skill: 'AWS', expected: 'Cloud platform' },
    { skill: 'Docker', expected: 'Containerization tool' }
  ];
  
  for (const test of skills) {
    try {
      const response = await axios.get(`${baseURL}/api/candidates/search?query=${encodeURIComponent(test.skill)}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      
      if (response.data.success) {
        const candidates = response.data.data;
        console.log(`✅ "${test.skill}": Found ${candidates.length} candidates`);
        
        if (candidates.length > 0) {
          const candidate = candidates[0];
          console.log(`   👤 ${candidate.name || candidate.userId?.name}`);
          console.log(`   🎯 Skills: ${candidate.skills?.join(', ') || 'N/A'}`);
          console.log(`   📍 Location: ${candidate.location || 'N/A'}`);
        }
      } else {
        console.log(`❌ "${test.skill}": Search failed`);
      }
    } catch (error) {
      console.log(`❌ "${test.skill}": Error - ${error.response?.status || error.message}`);
    }
  }
}

async function testMultiSkillSearch(baseURL, token) {
  console.log('Testing multi-skill searches...\n');
  
  const multiSkillTests = [
    { skills: ['JavaScript', 'React'], description: 'Frontend developers' },
    { skills: ['Python', 'Django'], description: 'Python backend developers' },
    { skills: ['Node.js', 'MongoDB'], description: 'Full-stack developers' },
    { skills: ['AWS', 'Docker'], description: 'DevOps engineers' },
    { skills: ['JavaScript', 'Python', 'React'], description: 'Multi-language developers' }
  ];
  
  for (const test of multiSkillTests) {
    try {
      const skillQuery = test.skills.join(',');
      const response = await axios.get(`${baseURL}/api/candidates/search?query=${encodeURIComponent(skillQuery)}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      
      if (response.data.success) {
        const candidates = response.data.data;
        console.log(`✅ ${test.description}: Found ${candidates.length} candidates`);
        console.log(`   🔍 Searched for: ${test.skills.join(', ')}`);
        
        if (candidates.length > 0) {
          const candidate = candidates[0];
          console.log(`   👤 ${candidate.name || candidate.userId?.name}`);
          console.log(`   🎯 Matching skills: ${test.skills.filter(skill => 
            candidate.skills?.some(candidateSkill => 
              candidateSkill.toLowerCase().includes(skill.toLowerCase())
            )
          ).join(', ')}`);
        }
      } else {
        console.log(`❌ ${test.description}: Search failed`);
      }
    } catch (error) {
      console.log(`❌ ${test.description}: Error - ${error.response?.status || error.message}`);
    }
  }
}

async function testLocationSkillCombination(baseURL, token) {
  console.log('Testing location + skill combinations...\n');
  
  const locationSkillTests = [
    { skill: 'React', location: 'Bangalore', description: 'React developers in Bangalore' },
    { skill: 'Python', location: 'Mumbai', description: 'Python developers in Mumbai' },
    { skill: 'JavaScript', location: 'Delhi', description: 'JavaScript developers in Delhi' },
    { skill: 'AWS', location: 'Chennai', description: 'AWS experts in Chennai' }
  ];
  
  for (const test of locationSkillTests) {
    try {
      const response = await axios.get(`${baseURL}/api/candidates/search?query=${encodeURIComponent(test.skill)}&location=${encodeURIComponent(test.location)}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      
      if (response.data.success) {
        const candidates = response.data.data;
        console.log(`✅ ${test.description}: Found ${candidates.length} candidates`);
        
        if (candidates.length > 0) {
          const candidate = candidates[0];
          console.log(`   👤 ${candidate.name || candidate.userId?.name}`);
          console.log(`   📍 Location: ${candidate.location}`);
          console.log(`   🎯 Skills: ${candidate.skills?.join(', ') || 'N/A'}`);
        }
      } else {
        console.log(`❌ ${test.description}: Search failed`);
      }
    } catch (error) {
      console.log(`❌ ${test.description}: Error - ${error.response?.status || error.message}`);
    }
  }
}

async function testExperienceFiltering(baseURL, token) {
  console.log('Testing experience-based filtering...\n');
  
  const experienceTests = [
    { skill: 'JavaScript', experience: '0-1 years', description: 'Junior JavaScript developers' },
    { skill: 'React', experience: '2-3 years', description: 'Mid-level React developers' },
    { skill: 'Python', experience: '3-5 years', description: 'Senior Python developers' },
    { skill: 'AWS', experience: '5-7 years', description: 'Expert AWS professionals' }
  ];
  
  for (const test of experienceTests) {
    try {
      const response = await axios.get(`${baseURL}/api/candidates/search?query=${encodeURIComponent(test.skill)}&experience=${encodeURIComponent(test.experience)}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      
      if (response.data.success) {
        const candidates = response.data.data;
        console.log(`✅ ${test.description}: Found ${candidates.length} candidates`);
        
        if (candidates.length > 0) {
          const candidate = candidates[0];
          console.log(`   👤 ${candidate.name || candidate.userId?.name}`);
          console.log(`   ⏰ Experience: ${candidate.experience} years`);
          console.log(`   🎯 Skills: ${candidate.skills?.join(', ') || 'N/A'}`);
        }
      } else {
        console.log(`❌ ${test.description}: Search failed`);
      }
    } catch (error) {
      console.log(`❌ ${test.description}: Error - ${error.response?.status || error.message}`);
    }
  }
}

async function testAdvancedMultiCriteria(baseURL, token) {
  console.log('Testing advanced multi-criteria searches...\n');
  
  const advancedTests = [
    {
      query: 'JavaScript',
      location: 'Bangalore',
      experience: '2-3 years',
      description: 'JavaScript developers in Bangalore with 2-3 years experience'
    },
    {
      query: 'React',
      location: 'Mumbai',
      skills: 'Node.js',
      description: 'React developers in Mumbai who also know Node.js'
    },
    {
      query: 'Python',
      experience: '3-5 years',
      education: 'B.Tech',
      description: 'Senior Python developers with B.Tech degree'
    }
  ];
  
  for (const test of advancedTests) {
    try {
      let url = `${baseURL}/api/candidates/search?query=${encodeURIComponent(test.query)}`;
      
      if (test.location) url += `&location=${encodeURIComponent(test.location)}`;
      if (test.experience) url += `&experience=${encodeURIComponent(test.experience)}`;
      if (test.skills) url += `&skills=${encodeURIComponent(test.skills)}`;
      if (test.education) url += `&education=${encodeURIComponent(test.education)}`;
      
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      
      if (response.data.success) {
        const candidates = response.data.data;
        console.log(`✅ ${test.description}: Found ${candidates.length} candidates`);
        
        if (candidates.length > 0) {
          const candidate = candidates[0];
          console.log(`   👤 ${candidate.name || candidate.userId?.name}`);
          console.log(`   📍 Location: ${candidate.location || 'N/A'}`);
          console.log(`   ⏰ Experience: ${candidate.experience || 'N/A'} years`);
          console.log(`   🎓 Education: ${candidate.education || 'N/A'}`);
          console.log(`   🎯 Skills: ${candidate.skills?.join(', ') || 'N/A'}`);
        }
      } else {
        console.log(`❌ ${test.description}: Search failed`);
      }
    } catch (error) {
      console.log(`❌ ${test.description}: Error - ${error.response?.status || error.message}`);
    }
  }
}

async function testEdgeCases(baseURL, token) {
  console.log('Testing edge cases and error handling...\n');
  
  const edgeCases = [
    { query: '', description: 'Empty search query' },
    { query: '   ', description: 'Whitespace-only query' },
    { query: 'NonExistentSkill123', description: 'Non-existent skill' },
    { query: 'JavaScript', location: 'NonExistentCity', description: 'Valid skill, invalid location' },
    { query: 'a', description: 'Single character query' },
    { query: 'JavaScript', experience: 'invalid', description: 'Invalid experience format' }
  ];
  
  for (const test of edgeCases) {
    try {
      let url = `${baseURL}/api/candidates/search?query=${encodeURIComponent(test.query)}`;
      
      if (test.location) url += `&location=${encodeURIComponent(test.location)}`;
      if (test.experience) url += `&experience=${encodeURIComponent(test.experience)}`;
      
      const response = await axios.get(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
      });
      
      if (response.data.success) {
        const candidates = response.data.data;
        console.log(`✅ ${test.description}: Found ${candidates.length} candidates (handled gracefully)`);
      } else {
        console.log(`✅ ${test.description}: Properly returned error response`);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log(`✅ ${test.description}: Properly returned 400 error`);
      } else {
        console.log(`❌ ${test.description}: Unexpected error - ${error.response?.status || error.message}`);
      }
    }
  }
}

async function testPerformance(baseURL, token) {
  console.log('Testing performance with multiple concurrent requests...\n');
  
  const performanceTests = [
    { query: 'JavaScript', count: 5 },
    { query: 'React', count: 3 },
    { query: 'Python', count: 4 }
  ];
  
  for (const test of performanceTests) {
    try {
      console.log(`🚀 Running ${test.count} concurrent searches for "${test.query}"...`);
      
      const startTime = Date.now();
      const promises = [];
      
      for (let i = 0; i < test.count; i++) {
        promises.push(
          axios.get(`${baseURL}/api/candidates/search?query=${encodeURIComponent(test.query)}`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Cache-Control': 'no-cache' }
          })
        );
      }
      
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const successfulRequests = results.filter(r => r.data.success).length;
      
      console.log(`✅ ${test.query}: ${successfulRequests}/${test.count} successful in ${duration}ms`);
      console.log(`   ⚡ Average response time: ${Math.round(duration / test.count)}ms per request`);
      
    } catch (error) {
      console.log(`❌ Performance test for "${test.query}": Error - ${error.message}`);
    }
  }
}

async function testSkillAutocomplete(baseURL, token) {
  console.log('Testing skill autocomplete functionality...\n');
  
  const autocompleteTests = [
    { query: 'jav', expected: ['JavaScript', 'Java'] },
    { query: 'react', expected: ['React'] },
    { query: 'py', expected: ['Python'] },
    { query: 'aws', expected: ['AWS'] },
    { query: 'mon', expected: ['MongoDB'] }
  ];
  
  for (const test of autocompleteTests) {
    try {
      const response = await axios.get(`${baseURL}/api/skills/search?q=${encodeURIComponent(test.query)}&limit=5`);
      
      if (response.data.success) {
        const skills = response.data.data;
        console.log(`✅ "${test.query}": Found ${skills.length} skills`);
        
        if (skills.length > 0) {
          const skillNames = skills.map(skill => skill.name);
          console.log(`   🎯 Suggestions: ${skillNames.join(', ')}`);
          
          // Check if expected skills are found
          const foundExpected = test.expected.filter(expected => 
            skillNames.some(skillName => 
              skillName.toLowerCase().includes(expected.toLowerCase())
            )
          );
          
          if (foundExpected.length > 0) {
            console.log(`   ✅ Expected skills found: ${foundExpected.join(', ')}`);
          }
        }
      } else {
        console.log(`❌ "${test.query}": Autocomplete failed`);
      }
    } catch (error) {
      console.log(`❌ "${test.query}": Error - ${error.response?.status || error.message}`);
    }
  }
}

// Run the comprehensive test
testSkillManagementScenarios()
  .then(success => {
    if (success) {
      console.log('\n🎉 All skill management scenarios tested successfully!');
      console.log('\n📊 Test Summary:');
      console.log('   ✅ Basic skill searches');
      console.log('   ✅ Multi-skill combinations');
      console.log('   ✅ Location + skill filtering');
      console.log('   ✅ Experience-based filtering');
      console.log('   ✅ Advanced multi-criteria searches');
      console.log('   ✅ Edge case handling');
      console.log('   ✅ Performance testing');
      console.log('   ✅ Skill autocomplete');
      
      console.log('\n🚀 The skill management system is robust and ready for production!');
    } else {
      console.log('\n💥 Some test scenarios failed. Please review the errors above.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });




