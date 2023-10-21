module.exports = {
    apps: [
        {
            name: 'openApi',
            script: './script/open-api.sh',
            watch: './apps/open-api/'
        },
        /* 
        {
            name: 'rollupSequencer',
            script: './script/rollup-seq.sh',
            watch: './apps/rollup-sequencer/'
        },
        */
        {
            name: 'deposit-seq',
            script: './script/deposit-seq.sh',
            watch: './apps/deposit-processor/'
        },
        {
            name: 'deposit-proof',
            script: './script/deposit-proof.sh',
            watch: './apps/deposit-processor/'
        },
        {
            name: 'deposit-fetch',
            script: './script/deposit-fetch.sh',
            watch: './apps/deposit-processor/'
        },
        /*
        {
            name: 'coordinator',
            script: './script/coordinator.sh',
            watch: './apps/coordinator/'
        },
        */
        /* 
        {
        name: 'proof-gen',
        script: './script/proof-gen.sh',
        watch: './apps/proof-generators/'
        }*/
    ],

    deploy: {
        production: {
            user: 'SSH_USERNAME',
            host: 'SSH_HOSTMACHINE',
            ref: 'origin/master',
            repo: 'GIT_REPOSITORY',
            path: 'DESTINATION_PATH',
            'pre-deploy-local': '',
            'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
            'pre-setup': ''
        }
    }
};
