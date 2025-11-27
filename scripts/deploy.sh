#!/bin/bash

# Script pour faciliter le déploiement
# Usage: ./scripts/deploy.sh [message de commit]

set -e

# Couleurs pour les messages
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Démarrage du déploiement...${NC}"

# Vérifier que nous sommes sur la bonne branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
  echo -e "${YELLOW}⚠️  Vous n'êtes pas sur main/master. Voulez-vous continuer ? (y/n)${NC}"
  read -r response
  if [ "$response" != "y" ]; then
    echo "Annulé."
    exit 1
  fi
fi

# Vérifier que le repo est à jour
echo -e "${BLUE}📥 Récupération des dernières modifications...${NC}"
git fetch origin

# Vérifier s'il y a des changements non commités
if [ -n "$(git status --porcelain)" ]; then
  echo -e "${BLUE}📝 Changements détectés, préparation du commit...${NC}"
  
  # Message de commit
  if [ -z "$1" ]; then
    COMMIT_MSG="chore: update before deployment [skip ci]"
  else
    COMMIT_MSG="$1 [skip ci]"
  fi
  
  # Ajouter tous les changements
  git add .
  
  # Commit
  git commit -m "$COMMIT_MSG" || echo "Aucun changement à commiter"
else
  echo -e "${GREEN}✅ Aucun changement à commiter${NC}"
fi

# Push vers GitHub
echo -e "${BLUE}📤 Push vers GitHub...${NC}"
git push origin "$CURRENT_BRANCH"

echo -e "${GREEN}✅ Déploiement déclenché !${NC}"
echo -e "${BLUE}📊 Suivez le déploiement sur:${NC}"
echo -e "   - GitHub Actions: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\(.*\)\.git/\1/')/actions"
echo -e "   - AWS Amplify Console"

