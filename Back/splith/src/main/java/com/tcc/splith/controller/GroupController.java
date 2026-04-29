package com.tcc.splith.controller;

import com.tcc.splith.config.JWTUserData;
import com.tcc.splith.dto.response.GroupDTO;
import com.tcc.splith.dto.response.GroupMemberDTO;
import com.tcc.splith.entity.Group;
import com.tcc.splith.entity.GroupMember;
import com.tcc.splith.entity.GroupRole;
import com.tcc.splith.entity.User;
import com.tcc.splith.repository.GroupMemberRepository;
import com.tcc.splith.repository.GroupRepository;
import com.tcc.splith.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/groups")
public class GroupController {

    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    public GroupController(GroupRepository groupRepository, UserRepository userRepository, GroupMemberRepository groupMemberRepository) {
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    // --- Helpers de permissão ---

    private GroupMember requireMembership(Long groupId, Long userId) {
        return groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: você não é membro deste grupo"));
    }

    private void requireAdmin(GroupMember membership) {
        if (membership.getRole() != GroupRole.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas administradores podem realizar esta ação");
        }
    }

    private void requireNotLastAdmin(Long groupId, GroupMember target) {
        if (target.getRole() == GroupRole.ADMIN && groupMemberRepository.countByGroupIdAndRole(groupId, GroupRole.ADMIN) <= 1) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível realizar esta ação: o grupo ficaria sem administrador");
        }
    }

    private JWTUserData loggedUser() {
        return (JWTUserData) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private List<GroupMemberDTO> membersOf(Long groupId) {
        return groupMemberRepository.findByGroupId(groupId).stream()
                .map(GroupMemberDTO::from)
                .toList();
    }

    // --- Endpoints ---

    public record GroupRequest(String name, String description) {}

    @PostMapping
    public ResponseEntity<GroupDTO> createGroup(@RequestBody GroupRequest request) {
        User user = userRepository.findById(loggedUser().userId()).orElseThrow();

        Group group = new Group();
        group.setName(request.name());
        group.setDescription(request.description());
        Group savedGroup = groupRepository.save(group);

        GroupMember creatorMembership = new GroupMember(user, savedGroup, GroupRole.ADMIN);
        groupMemberRepository.save(creatorMembership);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(GroupDTO.from(savedGroup, membersOf(savedGroup.getId())));
    }

    @GetMapping
    public ResponseEntity<List<GroupDTO>> getUserGroups() {
        User user = userRepository.findById(loggedUser().userId()).orElseThrow();
        List<Group> groups = groupRepository.findGroupsByMember(user);
        List<GroupDTO> groupDTOs = groups.stream()
                .map(g -> GroupDTO.from(g, membersOf(g.getId())))
                .toList();
        return ResponseEntity.ok(groupDTOs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GroupDTO> getGroupById(@PathVariable Long id) {
        Group group = groupRepository.findById(id).orElseThrow();
        requireMembership(id, loggedUser().userId());
        return ResponseEntity.ok(GroupDTO.from(group, membersOf(id)));
    }

    // --- Membros ---

    public record AddMemberRequest(String email) {}

    @PostMapping("/{groupId}/members")
    public ResponseEntity<Void> addMemberToGroup(@PathVariable Long groupId, @RequestBody AddMemberRequest request) {
        GroupMember callerMembership = requireMembership(groupId, loggedUser().userId());
        requireAdmin(callerMembership);

        Group group = groupRepository.findById(groupId).orElseThrow();
        User userToAdd = (User) userRepository.findUserByEmail(request.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado com este email"));

        if (groupMemberRepository.findByGroupIdAndUserId(groupId, userToAdd.getId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Usuário já é membro deste grupo");
        }

        groupMemberRepository.save(new GroupMember(userToAdd, group, GroupRole.MEMBER));
        return ResponseEntity.noContent().build();
    }

    public record ChangeRoleRequest(GroupRole role) {}

    @PutMapping("/{groupId}/members/{userId}/role")
    public ResponseEntity<Void> changeMemberRole(@PathVariable Long groupId, @PathVariable Long userId, @RequestBody ChangeRoleRequest request) {
        GroupMember callerMembership = requireMembership(groupId, loggedUser().userId());
        requireAdmin(callerMembership);

        GroupMember target = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));

        if (request.role() != GroupRole.ADMIN) {
            requireNotLastAdmin(groupId, target);
        }

        target.setRole(request.role());
        groupMemberRepository.save(target);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<Void> removeMember(@PathVariable Long groupId, @PathVariable Long userId) {
        Long callerId = loggedUser().userId();
        GroupMember callerMembership = requireMembership(groupId, callerId);

        boolean isSelf = callerId.equals(userId);
        if (!isSelf) {
            requireAdmin(callerMembership);
        }

        GroupMember target = groupMemberRepository.findByGroupIdAndUserId(groupId, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Membro não encontrado"));

        requireNotLastAdmin(groupId, target);

        groupMemberRepository.delete(target);
        return ResponseEntity.noContent().build();
    }
}
