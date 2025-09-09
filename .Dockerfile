FROM node:22.11.0-alpine

# Criar diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar arquivos de código
COPY *.js ./
COPY *.txt ./

# Copiar diretórios estáticos e templates
COPY static/ ./static/
COPY templates/ ./templates/

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Alterar ownership dos arquivos
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expor a porta 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando para iniciar a aplicação
CMD ["node", "app.js"]