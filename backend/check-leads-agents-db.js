const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log('✅ MongoDB connected');
  
  // Import models
  const User = require('./models/User');
  const Lead = require('./models/Lead');
  
  try {
    console.log('\n🔍 Checking leads connected with agents in database...\n');
    
    // 1. Get all agent users
    const agents = await User.find({ role: 'agent' }).select('_id name email role');
    console.log('📊 Agent Users in Database:');
    console.log('Count:', agents.length);
    agents.forEach(agent => {
      console.log(`- ${agent.name} (${agent.email}) - ID: ${agent._id}`);
    });
    
    // 2. Get leads with agents (populated)
    const leadsWithAgents = await Lead.find({ 
      agent: { $ne: null }, 
      isDeleted: false 
    }).populate('agent', 'name email role').limit(10);
    
    console.log('\n📋 Sample Leads with Agents (first 10):');
    console.log('Count:', leadsWithAgents.length);
    leadsWithAgents.forEach(lead => {
      console.log(`- ${lead.name} (${lead.phone}) -> Agent: ${lead.agent ? lead.agent.name : 'null'} (${lead.agent ? lead.agent.email : 'N/A'})`);
    });
    
    // 3. Get total counts
    const totalLeads = await Lead.countDocuments({ isDeleted: false });
    const leadsWithAgentsCount = await Lead.countDocuments({ agent: { $ne: null }, isDeleted: false });
    const leadsWithoutAgentsCount = await Lead.countDocuments({ agent: null, isDeleted: false });
    
    console.log('\n📈 Database Statistics:');
    console.log(`Total leads: ${totalLeads}`);
    console.log(`Leads with agents: ${leadsWithAgentsCount}`);
    console.log(`Leads without agents: ${leadsWithoutAgentsCount}`);
    
    // 4. Get leads by agent
    console.log('\n👥 Leads by Agent:');
    for (const agent of agents) {
      const agentLeadsCount = await Lead.countDocuments({ 
        agent: agent._id, 
        isDeleted: false 
      });
      console.log(`- ${agent.name}: ${agentLeadsCount} leads`);
    }
    
    // 5. Check agent field types
    console.log('\n🔍 Agent Field Analysis:');
    const sampleLeads = await Lead.find({ isDeleted: false }).limit(5);
    sampleLeads.forEach(lead => {
      console.log(`Lead: ${lead.name} - Agent field: ${lead.agent} (type: ${typeof lead.agent})`);
    });
    
    // 6. Get unique agent values
    const uniqueAgents = await Lead.distinct('agent', { isDeleted: false });
    console.log('\n📊 Unique Agent Values:');
    console.log(`Total unique agent values: ${uniqueAgents.length}`);
    uniqueAgents.slice(0, 10).forEach(agent => {
      console.log(`- ${agent} (type: ${typeof agent})`);
    });
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.connection.close();
  }
}).catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
});


