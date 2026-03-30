package com.tcc.splith.controller;

import com.tcc.splith.config.JWTUserData;
import com.tcc.splith.entity.Group;
import com.tcc.splith.entity.User;
import com.tcc.splith.repository.GroupRepository;
import com.tcc.splith.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;

    public GroupController(GroupRepository groupRepository, UserRepository userRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
    }

    // Record para receber os dados do Angular
    public record GroupRequest(String name, String description) {}

    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable Long id) {
        Group group = groupRepository.findById(id).orElseThrow();
        return ResponseEntity.ok(group);
    }

    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody GroupRequest request) {
        // 1. Descobre quem é o usuário logado
        JWTUserData loggedUser = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(loggedUser.userId()).orElseThrow();

        // 2. Cria o grupo com os dados do Frontend
        Group group = new Group();
        group.setName(request.name());
        group.setDescription(request.description());

        // 3. Adiciona o usuário que criou o grupo como o primeiro membro
        group.getMembers().add(user);

        // 4. Salva e devolve pro Angular
        Group savedGroup = groupRepository.save(group);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedGroup);
    }

    @GetMapping
    public ResponseEntity<List<Group>> getUserGroups() {
        // Descobre quem é o usuário logado
        JWTUserData loggedUser = (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findById(loggedUser.userId()).orElseThrow();

        // Busca apenas os grupos onde esse usuário está na lista de membros
        List<Group> groups = groupRepository.findByMembersContaining(user);
        return ResponseEntity.ok(groups);
    }
}